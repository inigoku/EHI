#!/usr/bin/env bash
# Descarga las imágenes que "El Horizonte Interior" enlaza directamente desde
# fuentes externas (Wikimedia/Wikipedia Commons, una foto de prensa vía
# Cloudfront, y una foto de ABC News) en vez de guardarlas en el repo — ver
# el mapa `cart_*` en src/components/IllustrationViewer.tsx.
#
# De las 14 imágenes, solo 2 son de dominio público (Las Meninas de
# Velázquez, y el retrato de George Eliot de 1865). Las otras 12 son obras
# de Dalí, Picasso y Miró (con derechos vigentes hasta ~2044-2060 en la UE)
# alojadas en Wikipedia bajo una licencia de "uso legítimo" válida solo para
# comentario enciclopédico dentro de Wikipedia, más dos fotos de prensa de
# 2026 con derechos de agencia/fotógrafo. Enlazarlas desde la web es una
# cosa; descargarlas para encuadernarlas en un documento distribuible
# (un PDF/DOCX del libro, por ejemplo) es un uso legalmente más expuesto,
# así que este script solo las descarga a un directorio local — decide tú,
# caso por caso, cuáles usar y dónde.
#
# Uso:
#   ./scripts/download_external_illustrations.sh [directorio_salida]
#
# Por defecto guarda en ./ilustraciones_externas/<id>.jpg

set -euo pipefail

OUT_DIR="${1:-./ilustraciones_externas}"
mkdir -p "$OUT_DIR"

# id | URL
declare -A IMAGES=(
  [cart_guernica]="https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg"
  [cart_construccion]="https://upload.wikimedia.org/wikipedia/en/8/89/SalvadorDali-SoftConstructionWithBeans.jpg"
  [cart_narciso]="https://upload.wikimedia.org/wikipedia/en/2/21/Metamorphosis_of_Narcissus.jpg"
  [cart_relojes]="https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg"
  [cart_desintegracion]="https://upload.wikimedia.org/wikipedia/en/7/7c/DisintegrationofPersistence.jpg"
  [cart_corpus]="https://upload.wikimedia.org/wikipedia/en/0/09/Dali_Crucifixion_hypercube.jpg"
  [cart_avignon]="https://upload.wikimedia.org/wikipedia/en/4/4c/Les_Demoiselles_d%27Avignon.jpg"
  [cart_llorona]="https://upload.wikimedia.org/wikipedia/en/1/14/Picasso_The_Weeping_Woman_Tate_identifier_T05010_10.jpg"
  [cart_meninas]="https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/1280px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg"
  [cart_masia]="https://upload.wikimedia.org/wikipedia/en/3/33/TheFarmMiro21to22.jpg"
  [cart_constelaciones]="https://upload.wikimedia.org/wikipedia/en/3/39/MiroMorningStar.JPG"
  [cart_eliot]="https://upload.wikimedia.org/wikipedia/commons/1/1b/George_Eliot_(1865)_by_Frederick_William_Burton.jpg"
  [cart_ferran_gol]="https://d3i6fh83elv35t.cloudfront.net/static/2026/07/2026-07-19T215113Z_1479842861_UP1EM7J1OPCXN_RTRMADP_3_SOCCER-WORLDCUP-ESP-ARG-1024x706.jpg"
  [cart_messi_yamal]="https://i.abcnewsfe.com/a/098c18d3-8236-4244-8a8a-85a58d51d9ed/messi-yamal-3-ap-gmh-260717_1784294935058_hpMain_4x3.jpg"
)

fail=0
for id in "${!IMAGES[@]}"; do
  url="${IMAGES[$id]}"
  ext="${url##*.}"
  ext="${ext%%\?*}"
  case "$ext" in
    jpg|JPG|jpeg) ext="jpg" ;;
    *) ext="jpg" ;;
  esac
  dest="$OUT_DIR/${id}.${ext}"
  echo "Descargando $id ..."
  if curl -sSL --fail --max-time 30 \
      -H "User-Agent: Mozilla/5.0 (compatible; EHI-book-build/1.0)" \
      -o "$dest" "$url"; then
    echo "  OK -> $dest ($(du -h "$dest" | cut -f1))"
  else
    echo "  FALLO: $id ($url)" >&2
    fail=1
  fi
done

echo ""
if [ "$fail" -eq 0 ]; then
  echo "Listo. 14 imágenes en $OUT_DIR/"
else
  echo "Algunas descargas fallaron — revisa los mensajes de arriba." >&2
fi
