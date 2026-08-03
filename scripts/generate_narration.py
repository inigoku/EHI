#!/usr/bin/env python3
"""
Genera el audio narrado de todos los cuentos de El Horizonte Interior
usando Google Cloud Text-to-Speech, y lo deja en public/audio/, listo
para que NarrationPlayer.tsx lo sirva en la web.

USO:
  1. Crea un proyecto en https://console.cloud.google.com/, activa la
     API "Cloud Text-to-Speech API" y genera una clave de servicio
     (Service Account -> Keys -> JSON).
  2. export GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/tu-clave.json
  3. pip install google-cloud-texttospeech --break-system-packages
  4. python3 scripts/generate_narration.py
     (opcional: --lang en   para generar solo inglés,
                --only cuento_ladron   para probar un solo cuento primero)

Coste: con voces WaveNet, el nivel gratuito cubre 1.000.000 de
caracteres al mes. Los 22 cuentos en español rondan bastante menos que
eso, así que en una ejecución dentro del mismo mes de facturación
debería salir gratis. El script imprime el total de caracteres antes
de llamar a la API para que puedas comprobarlo.
"""

import argparse
import os
import re
import sys
from pathlib import Path

try:
    from google.cloud import texttospeech
except ImportError:
    sys.exit(
        "Falta la librería. Instala con:\n"
        "  pip install google-cloud-texttospeech --break-system-packages"
    )

ROOT = Path(__file__).resolve().parent.parent
CUENTOS_DIR = ROOT / "content" / "cuentos"
OUTPUT_DIR = ROOT / "public" / "audio"

# Voces WaveNet (nivel gratuito: 1M caracteres/mes). Cambia si prefieres
# otra voz de la lista: https://cloud.google.com/text-to-speech/docs/voices
VOICE_BY_LANG = {
    "es": {"languageCode": "es-ES", "name": "es-ES-Wavenet-B"},
    "en": {"languageCode": "en-US", "name": "en-US-Wavenet-D"},
}

# Límite de bytes por request de la API (ver documentación de Google);
# se deja margen porque SSML/UTF-8 puede pesar más que el nº de caracteres.
MAX_BYTES_PER_REQUEST = 4500


def strip_markdown(raw: str) -> str:
    """Quita frontmatter, ilustraciones, cajas de notas y marcado
    markdown, dejando solo el texto narrable."""
    # Quita el frontmatter YAML (--- ... ---)
    raw = re.sub(r"^---.*?---\s*", "", raw, flags=re.DOTALL)
    # Quita bloques de ilustración [ILUSTRACIÓN ...] y su descripción en cursiva
    raw = re.sub(r"##\s*\[ILUSTRACIÓN.*?\]\s*\n\*.*?\*", "", raw, flags=re.DOTALL)
    # Quita encabezados markdown (#, ##, ###) dejando el texto
    raw = re.sub(r"^#{1,6}\s*", "", raw, flags=re.MULTILINE)
    # Quita énfasis markdown (*cursiva*, **negrita**)
    raw = re.sub(r"\*\*(.+?)\*\*", r"\1", raw)
    raw = re.sub(r"\*(.+?)\*", r"\1", raw)
    # Quita separadores horizontales ---
    raw = re.sub(r"^\s*---\s*$", "", raw, flags=re.MULTILINE)
    # Colapsa líneas en blanco múltiples
    raw = re.sub(r"\n{3,}", "\n\n", raw)
    return raw.strip()


def chunk_text(text: str, max_bytes: int) -> list[str]:
    """Trocea el texto en fragmentos que quepan en una request, cortando
    por párrafos para no partir frases a la mitad."""
    paragraphs = [p for p in text.split("\n\n") if p.strip()]
    chunks, current = [], ""
    for para in paragraphs:
        candidate = f"{current}\n\n{para}" if current else para
        if len(candidate.encode("utf-8")) > max_bytes:
            if current:
                chunks.append(current)
            current = para
        else:
            current = candidate
    if current:
        chunks.append(current)
    return chunks


def synthesize(client: "texttospeech.TextToSpeechClient", text: str, lang: str) -> bytes:
    voice_cfg = VOICE_BY_LANG[lang]
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code=voice_cfg["languageCode"], name=voice_cfg["name"]
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3, speaking_rate=0.95
    )
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )
    return response.audio_content


def generate_for_file(client, md_path: Path, lang: str) -> None:
    chapter_id = md_path.name.split(f".{lang}.md")[0]
    out_path = OUTPUT_DIR / f"{chapter_id}.{lang}.mp3"

    raw = md_path.read_text(encoding="utf-8")
    text = strip_markdown(raw)
    if not text:
        print(f"  [omitido] {chapter_id}: sin texto narrable")
        return

    chunks = chunk_text(text, MAX_BYTES_PER_REQUEST)
    print(f"  {chapter_id} ({lang}): {len(text)} caracteres, {len(chunks)} fragmento(s)")

    audio_parts = [synthesize(client, chunk, lang) for chunk in chunks]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(out_path, "wb") as f:
        for part in audio_parts:
            f.write(part)
    print(f"    -> {out_path.relative_to(ROOT)}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--lang", choices=["es", "en", "both"], default="both")
    parser.add_argument("--only", help="Generar solo un chapterId concreto (p. ej. cuento_ladron)")
    args = parser.parse_args()

    langs = ["es", "en"] if args.lang == "both" else [args.lang]

    client = texttospeech.TextToSpeechClient()

    total_chars = 0
    files_by_lang = {}
    for lang in langs:
        files = sorted(CUENTOS_DIR.glob(f"*.{lang}.md"))
        if args.only:
            files = [f for f in files if f.name.startswith(f"{args.only}.{lang}.md")]
        files_by_lang[lang] = files
        for f in files:
            total_chars += len(strip_markdown(f.read_text(encoding="utf-8")))

    print(f"Total estimado: {total_chars} caracteres en {sum(len(v) for v in files_by_lang.values())} archivo(s).")
    print("Nivel gratuito WaveNet: 1.000.000 caracteres/mes.\n")

    for lang in langs:
        print(f"--- Generando narración en {lang} ---")
        for md_path in files_by_lang[lang]:
            generate_for_file(client, md_path, lang)

    print("\nListo. Sube public/audio/ junto al resto del deploy para que los botones de Escuchar funcionen.")


if __name__ == "__main__":
    main()
