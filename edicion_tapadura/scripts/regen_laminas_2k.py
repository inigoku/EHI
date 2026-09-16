#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Regenera las 13 láminas de El Horizonte Interior a 2K con Imagen 4
y las recorta a la proporción de página con sangre (5.125 x 8.25").

    pip install google-genai pillow
    export GEMINI_API_KEY="tu_clave"
    python regen_laminas_2k.py

Salida: ./laminas_2k/<id>.jpg
Nota: 3:4 a 2K da ~1536x2048; recortado a proporción quedan ~1272x2048 = 248 ppp.
Es el máximo que da Imagen 4 hoy (solo admite 1K y 2K).
"""
import os, io, sys, time
from google import genai
from google.genai import types
from PIL import Image

OUT = "laminas_2k"
TARGET = 5.125 / 8.25          # proporción de página con sangre
MODEL = "imagen-4.0-generate-001"   # o imagen-4.0-ultra-generate-001

STYLE = (
    "Painterly digital book-illustration plate in the visual style of a literary essay "
    "frontispiece. Absolutely no text, no letters, no words, no numbers, no captions, no signage, "
    "no watermark, no signature anywhere in the image — purely visual, silent imagery. Deep "
    "navy-black background with amber-gold light, fine hand-drawn geometric or diagram-like lines "
    "where they fit, cinematic rim lighting, intricate but elegant and uncluttered, evocative "
    "rather than busy. Vertical format for a 5x8 inch hardcover book page, full bleed to the "
    "edges, no decorative border.\n\n"
)

PLATES = {
"obertura": "A village of wooden houses on stilts above a lagoon that is visibly retreating, wet mudflats exposed where water used to reach. An archivist sits at a small desk at the water's edge, writing in a ledger by lantern light, recording a new waterline drawn faintly on a post among many older ones. No boats moving, everything still. Amber lamplight against a deep navy-black night.",

"cap1": "A sealed glass sphere cut cleanly in half: the outer shell is dark, faceted, ornamented with fine engraved geometric patterns; the inner half glows from within with soft amber light and a delicate branching pattern like frost or veins, visible only because the sphere has been opened. No hand touches it. Suspended in black space, radial diagram lines faint behind it.",

"cap2": "Two luminous threads of light, one cool silver and one warm amber, spiral around each other across a dark void without ever touching, connecting two distant points of light like two distant hourglasses. Grains of sand from both hourglasses drift and mix midair between them, suspended, neither falling up nor down. Quiet, cosmic, no figures.",

"cap3": "A luthier's workbench at night, tools laid out with care, an unfinished violin body held in a clamp. The violin's surface is not wood grain and not puzzle pieces: it is made of many small human figures with linked arms, curled and fitted against one another like a frieze, their bodies forming the curves of the instrument — visible only close up, reading as texture from afar. A single tuning fork rests beside it, vibrating, drawn with fine concentric amber lines in the air. The room is deep navy-black; the only warm light is a small pool of amber from the lamp, falling on the violin. Cold blue shadows everywhere else, no sepia, no brown tint overall. No people.",

"interludio": "A doorway stands alone with no walls around it, open onto total darkness on one side and a dim sunlit room on the other, exactly at the threshold of a large bed. A figure lies half in the lit room and half dissolved into the dark side, caught mid-crossing. Thin gold outline marks the doorframe against the navy-black void. Still, nocturnal, no other furniture.",

"cap4": "A perfectly flat horizon line cracked like broken glass, the fracture radiating from a single point where two small hands reach toward each other from opposite shores without touching. Behind the crack, faint silhouettes of many other people reaching too, half-submerged in the line itself. Deep amber light bleeding through the fracture, everything else navy-black.",

"cap5": "An empty wooden chair on a courtyard balcony at dusk, a shawl draped over its backrest, a cold cup of coffee on the stone floor beside it. A low warm lamp to one side throws the chair's shadow across the floor toward the viewer — and that shadow is the subject of the picture: unnaturally long, stretching far past where it should end, and along its length it comes apart, its outline breaking into a drifting trail of fine glowing amber particles that scatter into the dark like ash or breath. The shadow is clearly visible and dominates the lower half of the composition. No person anywhere in the frame. Deep navy-black night beyond the balcony.",

"cap6": "An old hand-drawn map spread on a desk, fully detailed and inked up to a certain radius, beyond which the parchment is simply blank and unclaimed. A brass compass rests exactly on the border between the drawn and the undrawn, and a pair of calipers measures that edge. No legend, no labels, no writing of any kind. A small pool of warm amber lamplight on the drawn half, the blank half fading into deep navy-black.",

"coda": "A small dog asleep with its head resting on a folded blanket, a human hand resting gently on its back. From the dog's muzzle, thin golden threads drift upward and out through a nearby window into a starry night sky, unspooling like breath made visible and scattering into fine amber particles. Warm amber interior light around the dog, deep navy-black night beyond the window. Tender, still, no human face visible.",

"espejo": "A perfectly polished mirror of water gives back the face of a person leaning over it, but the mirror is mounted on a sheet with no thickness at all: seen edge-on it has nothing behind it, only a razor-thin line of light. Around it, thousands of faint reflected faces of other people float in the dark like scattered data points, none of them casting a shadow. The one leaning face casts a long real shadow. Cold silver-blue surface against warm amber surroundings.",

"diapason": "A dark-metal tuning fork vibrates alone in a dim room before dawn; its sound waves are drawn as thin concentric amber lines in the air, spreading toward a window beyond which nothing at all can be seen, only black. On a wooden table below, five small objects lined up in a row: a plain cross, a rolled prayer rug, a dharma wheel, a lotus flower and a blank open notebook. Quiet, devotional, no people.",

"ojo": "A vast night crowd seen from directly overhead, every person tinted the same single deep red. The crowd does not fill the frame: it occupies only a wide horizontal lens-shaped area across the middle of the page, like a long pointed leaf lying on its side — its two ends taper to sharp points at the far left and far right edges, while its top and bottom edges curve gently toward each other. Above and below that shape there are no people at all, only empty black. Within the shape, the crowd thickens toward a round darker mass at the center. Exactly one single figure, pale amber, is stepping out past the tapering lower edge, alone against the black. The overall silhouette should read like a half-closed eye. Aerial view, no legible faces.",

"fractal": "An infinite apartment stairwell with no front door at the bottom and no rooftop at the top, seen from inside, spiraling both upward and downward into darkness. On every landing a door stands ajar, and through each door a small lit room is visible in which a solitary figure sits imagining the room on the floor below, drawn in miniature inside their head. The structure repeats at every scale like a fractal, smaller and smaller, warm amber light on each landing.",
}


def crop_to_ratio(im):
    w, h = im.size
    if w / h > TARGET:
        nw = int(h * TARGET)
        return im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    nh = int(w / TARGET)
    return im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))


def main():
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("Falta GEMINI_API_KEY")
    client = genai.Client(api_key=key)
    os.makedirs(OUT, exist_ok=True)

    only = sys.argv[1:]              # opcional: regenerar solo algunas
    for pid, scene in PLATES.items():
        if only and pid not in only:
            continue
        print(f"-> {pid} ...", end=" ", flush=True)
        try:
            r = client.models.generate_images(
                model=MODEL,
                prompt=STYLE + scene,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="3:4",       # el más alto que admite Imagen 4
                    image_size="2K",          # clave: por defecto va a 1K
                    person_generation="allow_adult",
                ),
            )
            im = Image.open(io.BytesIO(r.generated_images[0].image.image_bytes)).convert("RGB")
            before = im.size
            im = crop_to_ratio(im)
            im.save(f"{OUT}/{pid}.jpg", quality=95)
            print(f"{before} -> {im.size}  ({im.size[0]/5.125:.0f} ppp)")
        except Exception as e:
            print("ERROR:", e)
        time.sleep(1)


if __name__ == "__main__":
    main()
