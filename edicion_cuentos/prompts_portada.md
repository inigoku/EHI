# Prompts de portada — volúmenes III y II (edición inglesa)

Los cuatro tomos comparten motivo (el agua, el horizonte) y técnica: óleo
sobre lienzo en azul verdoso, con pincelada gruesa y visible. El volumen I es
una esfera de vidrio bajo el agua; el IV, una ola con rostro; el II, una cinta
de Möbius de agua sobre un mar tormentoso. Falta que el III (cuentos) entre en
la serie: su portada actual es una acuarela crema, de otra familia.

Formato de salida: vertical 2:3, a 4K si el modelo lo da (la cubierta de tapa
dura necesita unos 1875 × 2775 px como mínimo para llegar a 300 ppp). Guardar
el resultado como `edicion_cuentos/imagenes/portada_2k.jpg`.

## Volumen III — Fables from Tarel (nuevo)

```
Vertical book cover illustration, 2:3 portrait. Oil painting on canvas with
thick visible brushwork and palette-knife impasto; painterly, quiet and
slightly dreamlike; fine-art realism, not digital illustration, not cartoon,
not anime, not 3D render, not photograph.

Scene: Tarel, a small old harbour town at blue hour, seen from across a wide
tidal flat. The sea has withdrawn far from its quay and left a vast shining
plain of wet mud and shallow channels that mirror the sky. Wooden houses on
stilts, mooring posts, a few boats lying on their sides in the mud, three or
four warm lit windows. Far away, at the horizon, one thin bright band of
returning water. In the foreground, small against the scale, a single figure
seen from behind, an archivist holding a lantern and a notebook, standing at
the edge of the mud.

Palette: deep teal, petrol blue and ink-green darks; cold silver-white
highlights on the water; one small accent of warm amber from the lanterns.
Same family as a series of covers painted in teal oil (a stormy sea, a glass
sphere under water, a wave shaped like a face).

Composition: horizon in the lower third. Upper quarter of the sky calm and
darker, left clear for the title. Lower quarter a calm dark mud foreground,
left clear for the author's name. Nothing important within 8% of the edges
(the image is cropped for a hardcover wrap).

No text, no lettering, no signature, no watermark, no frame, no paper border.
```

## Volumen II — Topological Readings (opcional)

La portada actual (cinta de Möbius de agua) ya está en la familia y el tema,
y recomiendo conservarla. Si se quiere una nueva, una alternativa:

```
Vertical book cover illustration, 2:3 portrait. Oil painting on canvas with
thick visible brushwork; fine-art realism, not digital illustration.

Scene: a large round lens of clear glass, like an antique reading lens, floats
upright above a dark stormy teal sea at dusk. Through the lens the same sea
looks different: calm, silver, and lit from below, as if it were another
place. Around the rim of the lens the real storm waves break and spray.

Palette: deep teal, petrol blue, ink-green darks; cold silver-white highlights;
no warm colours except a very faint amber edge on the lens.

Composition: lens centred slightly below the middle. Upper quarter of sky calm
and dark for the title; lower quarter dark water for the author's name.
Nothing important within 8% of the edges.

No text, no lettering, no signature, no watermark, no frame.
```

## Al recibir la imagen

La cubierta de los cuentos (`scripts/build_cover.py`) monta hoy una lámina
enmarcada sobre fondo crema. Con una pintura a sangre hay que cambiarla al
tratamiento de las otras tres (velo oscuro y rótulo claro, como
`edicion_poesia/scripts/build_cover.py`). Se hace una vez exista la imagen.
