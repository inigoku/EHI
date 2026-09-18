#!/usr/bin/env python3
"""Regenera a alta resolución la imagen de la portada.

La cubierta sale de la imagen de la sección de poesía de la web
(src/assets/images/landing/poems_landing.png), que mide 364 x 392 px. Para una
cubierta de 6 x 9" con sangre a 300 ppp harían falta 1875 x 2775: siete
aumentos. Este script pide la misma escena a los modelos de imagen de Gemini,
en vertical 2:3 —la proporción de la cubierta— y al mayor tamaño que dé la
cuenta.

    pip install google-genai pillow
    export GEMINI_API_KEY="tu_clave"          # de aistudio.google.com
    python3 edicion_poesia/scripts/regen_portada_2k.py

Escribe edicion_poesia/imagenes/portada_2k.jpg. A partir de ahí build_cover.py
la usa sola: busca ese fichero antes que el de la web y dice al arrancar de
cuál está tirando.

Con --variantes N pide N imágenes y las deja numeradas en
imagenes/portada_2k_opciones/ sin tocar la que está en uso, para elegir.

El script baja por una escalera de modelos y tamaños y se queda en el primero
que la cuenta le deje usar:

    gemini-3-pro-image-preview   4K   ~2730 x 4096 px   437 ppp a tamaño cubierta
    gemini-3-pro-image-preview   2K   ~1365 x 2048 px   218 ppp
    gemini-2.5-flash-image       1K   ~1024 px de lado  164 ppp
    imagen-4.0-generate-001      2K   1536 x 2048 px    221 ppp  (solo Vertex)

Con 4K la cubierta queda por fin nativa a 300 ppp, sin ampliar. Los demás
escalones siguen siendo muchos más píxeles reales que los 364 de ahora, y
build_cover.py completa lo que falte.

Imagen 4 solo se intenta si hay un proyecto de Google Cloud con Vertex AI
(GOOGLE_CLOUD_PROJECT, y GOOGLE_CLOUD_LOCATION si no vale us-central1): el SDK
no deja llamarlo con una clave de desarrollador suelta. Para forzar un modelo
concreto: GEMINI_IMAGE_MODEL.
"""
from __future__ import annotations

import argparse
import io
import logging
import os
import sys
import warnings
from pathlib import Path

# El SDK avisa por su cuenta de cosas que aquí no vienen a cuento; solo
# estorban a la salida.
logging.getLogger("google_genai").setLevel(logging.ERROR)
logging.getLogger("google_genai.models").setLevel(logging.ERROR)
warnings.filterwarnings("ignore", module="google.genai")

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "edicion_poesia" / "imagenes" / "portada_2k.jpg"
OPTIONS_DIR = ROOT / "edicion_poesia" / "imagenes" / "portada_2k_opciones"

# 2:3 es la proporción de la cubierta con sangre (6,25 x 9,25" = 0,676), así
# que casi no hay que recortar nada después.
ASPECT = "2:3"
COVER_W_IN = 6.25          # ancho de la cubierta con sangre, para dar los ppp

# Escalera de intentos: modelo, tamaño pedido, si hace falta Vertex.
LADDER = [
    ("gemini-3-pro-image-preview", "4K", False),
    ("gemini-3-pro-image-preview", "2K", False),
    ("gemini-2.5-flash-image", None, False),
    ("imagen-4.0-generate-001", "2K", True),
]

# La escena es la de la web: un rostro sereno que emerge del oleaje. El encargo
# dice además dónde va cada cosa, porque la cubierta lleva un velo de tinta en
# la franja de arriba, donde va el título, y en la de abajo, donde va el autor:
# si el rostro sube o baja demasiado, se lo come el velo.
PROMPT = (
    "A vast open sea filling the entire frame, and within the swell a serene "
    "human face in profile, eyes closed, turned to the left, formed out of the "
    "water itself — the brow, nose, lips and chin sculpted from a rising "
    "turquoise wave, the crown of the head dissolving upward into the curling "
    "crest and its spray, so that the face and the wave are one continuous "
    "body of water. The face is calm, almost asleep, neither clearly male nor "
    "female, translucent, with light passing through it as through a wave "
    "about to break.\n\n"
    "Composition for a vertical book cover: the face sits in the middle third "
    "of the image, its profile a little left of centre, large but not touching "
    "the edges. The upper third is open water and dark spray, deliberately "
    "quiet and uncluttered. The lower third is deep water and heavy swells, "
    "also quiet, with no focal point. Both bands must stay calm enough to hold "
    "text over them.\n\n"
    "Style: painterly photographic realism, with the texture of oil paint seen "
    "close up. Cold palette of deep teal, petrol blue and blue-green, white "
    "foam threading through it. No warm colour anywhere, no sunlight, no "
    "horizon line, no sky, no beach, no boat, and no figure other than the "
    "face in the water. Overcast diffuse light. Absolutely no text, no "
    "letters, no words, no numbers, no captions, no watermark and no signature "
    "anywhere in the image — purely visual. Vertical format, full bleed to the "
    "edges, no decorative border, no frame."
)


def _clients():
    """Devuelve (cliente de clave suelta, cliente de Vertex). Cualquiera puede faltar."""
    try:
        from google import genai
    except ImportError:
        sys.exit("Falta el paquete: pip install google-genai")

    plain = vertex = None
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        plain = genai.Client(api_key=key)
    project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    if project:
        vertex = genai.Client(
            vertexai=True,
            project=project,
            location=os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1"),
        )
    if plain is None and vertex is None:
        sys.exit(
            "Falta GEMINI_API_KEY.\n"
            '  export GEMINI_API_KEY="tu_clave"        (de aistudio.google.com)\n'
            "Para el escalón de Imagen 4 hace falta además un proyecto con Vertex AI:\n"
            '  export GOOGLE_CLOUD_PROJECT="mi-proyecto"'
        )
    return plain, vertex


def _via_imagen(client, n: int, size: str, model: str) -> list[bytes]:
    from google.genai import types

    result = client.models.generate_images(
        model=model,
        prompt=PROMPT,
        config=types.GenerateImagesConfig(
            number_of_images=n,
            aspect_ratio="3:4",          # lo más alto que admite Imagen 4
            image_size=size,
            person_generation="allow_adult",
        ),
    )
    return [g.image.image_bytes for g in result.generated_images]


def _via_gemini(client, n: int, size: str | None, model: str, vertex: bool) -> list[bytes]:
    from google.genai import types

    fields = {"aspect_ratio": ASPECT}
    if size:
        fields["image_size"] = size
    if vertex:
        # Fuera de Vertex, la API de desarrollador rechaza este campo.
        fields["person_generation"] = "allow_adult"
    config = types.GenerateContentConfig(
        response_modalities=["IMAGE"],
        image_config=types.ImageConfig(**fields),
    )
    out: list[bytes] = []
    for _ in range(n):
        response = client.models.generate_content(
            model=model, contents=PROMPT, config=config
        )
        for candidate in response.candidates or []:
            parts = getattr(candidate.content, "parts", None) or []
            for part in parts:
                blob = getattr(part, "inline_data", None)
                if blob and blob.data:
                    out.append(blob.data)
    return out


def _fatal(text: str) -> None:
    """Corta con un mensaje claro si el error no tiene sentido reintentar."""
    if "API_KEY_INVALID" in text or "API key not valid" in text:
        sys.exit(
            "La clave de GEMINI_API_KEY no vale. Google la rechaza con\n"
            "API_KEY_INVALID, que quiere decir que no existe o que se ha borrado,\n"
            "no que esté restringida. Saca una nueva en aistudio.google.com\n"
            "(«Get API key») y vuelve a probar."
        )
    if "RESOURCE_EXHAUSTED" in text or "429" in text:
        sys.exit("Cuota agotada. Prueba más tarde o con menos variantes.")


def generate(n: int) -> tuple[list[bytes], str]:
    plain, vertex = _clients()
    forced = os.environ.get("GEMINI_IMAGE_MODEL")
    ladder = [(forced, os.environ.get("GEMINI_IMAGE_SIZE"), False)] if forced else LADDER

    last = ""
    for model, size, needs_vertex in ladder:
        client = vertex if needs_vertex else (plain or vertex)
        if client is None:
            continue
        on_vertex = client is vertex
        label = f"{model} · {ASPECT} · {size or 'tamaño por defecto'}"
        print(f"-> {label}", flush=True)
        try:
            if "imagen" in model:
                images = _via_imagen(client, n, size or "2K", model)
            else:
                images = _via_gemini(client, n, size, model, on_vertex)
            if images:
                return images, label
            last = "no devolvió ninguna imagen"
        except Exception as exc:                       # noqa: BLE001
            last = str(exc)
            _fatal(last)
        print(f"   no disponible: {last.splitlines()[0][:150]}")

    sys.exit(
        "Ningún modelo de la escalera está disponible para esta cuenta.\n"
        f"El último error fue: {last}"
    )


def save(raw: bytes, path: Path) -> tuple[int, int]:
    from PIL import Image

    im = Image.open(io.BytesIO(raw)).convert("RGB")
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "JPEG", quality=95, subsampling=0, dpi=(300, 300))
    return im.size


def report(w: int, h: int) -> str:
    dpi = w / COVER_W_IN
    verdict = "nativa a 300 ppp" if dpi >= 300 else f"build_cover.py la subirá a 300"
    return f"{w} x {h} px  ·  {dpi:.0f} ppp a tamaño cubierta  ·  {verdict}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--variantes", type=int, default=0, metavar="N",
                    help="pide N imágenes a elegir en imagenes/portada_2k_opciones/ "
                         "en lugar de sustituir la portada en uso")
    args = ap.parse_args()

    n = args.variantes or 1
    if not 1 <= n <= 4:
        sys.exit("--variantes admite de 1 a 4")

    images, label = generate(n)
    print(f"   {label}: {len(images)} imagen(es)\n")

    if args.variantes:
        for i, raw in enumerate(images, start=1):
            path = OPTIONS_DIR / f"portada_2k_{i:02d}.jpg"
            print(f"{path.relative_to(ROOT)}  {report(*save(raw, path))}")
        print("\nElige una y cópiala encima de la que usa la cubierta:")
        print(f"  cp {OPTIONS_DIR.relative_to(ROOT)}/portada_2k_01.jpg {OUT.relative_to(ROOT)}")
        print("  python3 edicion_poesia/scripts/build_cover.py --paginas 78")
    else:
        print(f"{OUT.relative_to(ROOT)}  {report(*save(images[0], OUT))}")
        print("\nAhora vuelve a montar la cubierta:")
        print("  python3 edicion_poesia/scripts/build_cover.py --paginas 78")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
