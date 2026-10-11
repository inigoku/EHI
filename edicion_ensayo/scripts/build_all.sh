#!/bin/bash
# Regenera todos los PDFs, EPUBs y cubiertas (es/ca/en × volumen único, tomo I, tomo II).
# Uso (desde edicion_ensayo/): bash scripts/build_all.sh [es|ca|en]   (sin argumento: los tres)
set -e
cd "$(dirname "$0")/.."
build() { # lg suf toc name tomoflag
  local lg=$1 toc=$2 name=$3 tomo=$4
  python3 scripts/build_interior_premium.py $toc -o ${name}_6x9.pdf
  python3 scripts/build_interior_premium.py $toc -o ${name}_sin_ilustraciones_6x9.pdf --sin-ilustraciones
  python3 scripts/build_epub_ensayo.py $toc -o ${name}.epub
  python3 scripts/build_epub_ensayo.py $toc -o ${name}_sin_ilustraciones.epub --sin-ilustraciones
  python3 scripts/build_cover.py $tomo --idioma $lg
  python3 scripts/build_cover_paperback.py $tomo --idioma $lg --sin-ilustraciones
}
one() {
  case $1 in
   es) build es toc_ensayo.json El_Horizonte_Interior_Ensayo ""
       build es toc_tomo1_ensayo.json El_Horizonte_Interior_Tomo1_Ensayo "--tomo 1"
       build es toc_tomo2_lecturas.json El_Horizonte_Interior_Tomo2_Lecturas "--tomo 2";;
   ca) build ca toc_ensayo_ca.json El_Horitzo_Interior_Assaig ""
       build ca toc_tomo1_ensayo_ca.json El_Horitzo_Interior_Tom1_Assaig "--tomo 1"
       build ca toc_tomo2_lecturas_ca.json El_Horitzo_Interior_Tom2_Lectures "--tomo 2";;
   en) build en toc_ensayo_en.json The_Inner_Horizon_Essay ""
       build en toc_tomo1_ensayo_en.json The_Inner_Horizon_Tomo1_Essay "--tomo 1"
       build en toc_tomo2_lecturas_en.json The_Inner_Horizon_Tomo2_Readings "--tomo 2";;
  esac
}
for l in ${@:-es ca en}; do one $l; done
