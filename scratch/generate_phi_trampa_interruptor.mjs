import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Falta GEMINI_API_KEY en .env");
  process.exit(1);
}

const STYLE = `Vertical portrait-format ink and watercolor book illustration, painterly, in the
style of a quiet literary graphic-novel plate. Absolutely no text, no letters, no words, no
numbers, no captions, no diagrams with labels, no signage, no watermark, no signature anywhere
in the image — purely visual, silent imagery. Loose expressive ink linework, soft layered
watercolor washes, atmospheric and hushed. Recurring visual language across this whole series:
consciousness rendered as warm amber-gold light emerging gradually out of cool, dark indigo-grey
— never a hard on/off contrast, always a soft gradient, like a dial rather than a switch.`;

const PAGES = [
  {
    name: "portada",
    prompt: `${STYLE}

COVER IMAGE. A medium-sized mixed-breed dog with short cinnamon-tan fur and a white patch on
its chest sits quietly, looking directly out at the viewer with calm, present, attentive eyes.
Around the dog, instead of a normal room, a soft circular gradient of light: deep cold indigo
at the outer edges, warming gradually toward a gentle amber-gold glow centered on the dog,
like a dial or a dimmer slowly turned up. No background details, just the gradient and the dog.

Intimate, warm, quietly luminous, centered composition, as if this single image were the cover
of the whole story.`,
  },
  {
    name: "pagina1",
    prompt: `${STYLE}

Close view of the same dog from the cover, indoors in a modest home, sitting and looking up at
someone just out of frame (only a hand is visible, resting gently near the dog's head). The
dog's gaze is calm and steady, not scanning, not vacant — present. Warm domestic lamplight.

Warm amber-gold light on the dog and the hand, soft cool shadow in the rest of the room.
Tender, quiet, intimate framing.`,
  },
  {
    name: "pagina2",
    prompt: `${STYLE}

A 17th-century-style engraving-influenced scene rendered in ink and watercolor: an old wooden
writing desk, quill and papers, and beside it, the silhouette of a dog rendered as if it were a
clockwork automaton — faint gears and mechanical linework visible beneath its outline, hollow
and empty inside, no warm glow anywhere in its body. The room around it is dim, cool, and grey.

Cold, desaturated palette throughout — no warmth at all in this one image, deliberately empty
and mechanical, historical study-room atmosphere.`,
  },
  {
    name: "pagina3",
    prompt: `${STYLE}

A large old-fashioned wall light switch, shown in extreme close-up, mounted on a plain wall.
One half of the image (around the "off" position) is rendered in flat, hard-edged cold
darkness; the other half (around the "on" position) is flat, hard-edged warm light — with a
sharp, unnatural, abrupt line between them, no gradient at all, unlike every other image in
this series.

Stark, binary, deliberately harsh and flat composition — meant to feel wrong and too simple
compared to the soft gradients elsewhere.`,
  },
  {
    name: "pagina4",
    prompt: `${STYLE}

A wide horizontal-feeling composition (within the vertical frame) showing an evolutionary
progression of softly glowing silhouettes rendered as a single continuous gradient of light —
from a tiny dim point of light at the bottom, through simple curved forms, up to a taller
upright glowing figure at the top — all connected by one unbroken flowing line of light with
no steps, no breaks, no discrete jumps between the shapes.

Deep indigo background, one continuous warm amber-gold gradient of light flowing through the
whole composition, emphasizing smooth continuity rather than any single sharp transition.`,
  },
  {
    name: "pagina5",
    prompt: `${STYLE}

A simple bedroom at the moment of waking: a person in bed, seen from behind or in soft
silhouette, with the entire image split as a single smooth horizontal gradient — deep cool
indigo night at the top of the frame near the ceiling, softening gradually down into warm
gold morning light at the bottom near the bed and floor, as though dawn were a dial slowly
turning up rather than a line.

Soft, slow, continuous gradient dominating the whole image, tender and unhurried.`,
  },
  {
    name: "pagina6",
    prompt: `${STYLE}

A simple household wall thermostat, shown centered and alone against a plain wall, its small
display dark and cold, glowing only faintly with a dim grey-blue light — no warmth at all. The
thermostat is rendered split cleanly in half down the middle, the two halves separated by a
small gap, emphasizing that dividing it produces nothing more than two inert pieces.

Cold, minimal, slightly clinical composition, deliberately the least warm image in the series.`,
  },
  {
    name: "pagina7",
    prompt: `${STYLE}

An extreme macro view as if under a microscope: a tiny, translucent worm curled on a dark
background, its simple nervous system visible faintly inside its body as a small number of
delicate glowing threads and nodes, emitting a very faint, small warm amber-gold glow — like a
single small candle flame in a vast dark room.

Mostly cool, dark, vast negative space around one small, faint, warm point of light at the
center — emphasizing how small and fragile this glow is.`,
  },
  {
    name: "pagina8",
    prompt: `${STYLE}

A bee in flight above a stylized hive, leaving behind it a looping, figure-eight trail of soft
glowing golden light — its "waggle dance" rendered as a luminous line hanging in the air. The
bee itself and the trail glow warm amber-gold against a dusky blue evening background, more
light and more structure than the worm's page, still modest in scale.

Delicate, warm-glowing trail against a cool dusk background, graceful and precise composition.`,
  },
  {
    name: "pagina9",
    prompt: `${STYLE}

An octopus rendered underwater in soft ink and watercolor, each of its eight tentacles glowing
faintly with its own slightly different warm hue and rhythm of light — like many small separate
glows rather than one single unified glow, none of them dominant, all loosely coordinated
around a dim, barely-brighter center where the head would be.

Deep blue-green underwater palette, multiple soft independent warm glows along the tentacles,
harmonious but clearly distributed rather than centralized.`,
  },
  {
    name: "pagina10",
    prompt: `${STYLE}

The same dog from the cover and page 1, now shown close alongside a human hand gently touching
its head. Faintly overlaid on both the dog's head and the person's hand/arm, like a delicate
translucent watercolor ghost, the same soft internal glowing shapes are visible in both — echoing
each other, one warm amber-gold glow shared between animal and human.

Tender, warm, intimate close framing, the shared internal glow as the emotional and visual
center of the image.`,
  },
  {
    name: "pagina11",
    prompt: `${STYLE}

A quiet, dim hospital operating room, a patient lying still. Rising from the patient, rendered
in delicate glowing light-lines, a tall structure like a house of cards is shown mid-collapse,
its upper cards already scattering into loose motes of fading light, the whole structure losing
its warm amber-gold glow and cooling toward dim blue-grey as it falls apart.

Cool clinical room tones, the collapsing glowing structure as the sole warm (fading to cool)
focal point, delicate and unsettling rather than frightening.`,
  },
  {
    name: "pagina12",
    prompt: `${STYLE}

The same operating room and patient as the previous page, but now the delicate house-of-cards
structure of light-lines above the patient is rebuilding itself, motes of fading light drawing
back together and warming again from dim blue-grey back into gentle amber-gold, mid-restoration,
alongside a small glowing dial or gauge visible nearby with its needle turning back upward from
near zero.

Same cool room tones as before, but now the light-structure and the small dial are both
warming and rising, hopeful and gentle rather than dramatic.`,
  },
  {
    name: "pagina13",
    prompt: `${STYLE}

A newborn baby lying in a simple crib, eyes open and following a soft beam of warm golden light
coming through a nearby window, tiny hand slightly reaching. The baby's small chest area shows
the faintest hint of the same soft inner glow used throughout this series, very dim and small
but clearly present.

Tender domestic nursery scene, warm soft light, gentle and quiet composition, small scale of
the glow appropriate to a beginning.`,
  },
  {
    name: "pagina14",
    prompt: `${STYLE}

The inside of an MRI scanner tunnel, a patient's head visible at one end, and floating in the
dim scanner light above them, rendered only in soft glowing lines with no legible text, the
faint outline of a tennis racket and ball — a thought made briefly visible as pale warm light
against the cool clinical blue of the machine.

Cool, dim, clinical scanner tones, one small warm glowing shape as the sole point of meaning
and light in the frame.`,
  },
  {
    name: "pagina15",
    prompt: `${STYLE}

A human head shown in profile, rendered mostly as soft ink linework, with a fine glowing line
running down its center dividing it cleanly into two halves. Within each half, a small,
separate, softly glowing point of awareness is visible, each slightly different in warmth and
rhythm, neither one clearly larger or more dominant than the other.

Calm, symmetrical, contemplative composition, warm amber-gold glow present but clearly split
into two distinct centers rather than one.`,
  },
  {
    name: "pagina16",
    prompt: `${STYLE}

A single large circular dial or gauge, like an old analog meter, filling most of the frame,
glowing softly from within. Around its curved arc, at different positions from near-zero to
near-maximum, small simple silhouette icons are arranged: a thermostat near the dark end, then
a tiny worm, a bee, an octopus, a dog, and finally a bright human silhouette near the brightest
end of the arc, with the dial's needle resting near the human end.

Deep indigo background, the dial itself glowing in a smooth gradient from cool dark blue-grey
at one end to warm amber-gold at the other, unifying the whole visual series into one chart-like
image without any text or labels.`,
  },
  {
    name: "pagina17",
    prompt: `${STYLE}

An orchestra seen from above in soft golden stage light, musicians arranged in their sections,
each holding an instrument. Faint, delicate threads of warm light connect each musician to the
others, all converging and rising together into a single larger glow suspended above the center
of the stage — no single musician glowing brighter than the rest, the glow itself only existing
where the threads meet.

Warm golden stage lighting, dark surrounding hall, elegant overhead composition, emphasizing the
emergent glow above the players rather than any individual.`,
  },
  {
    name: "pagina18",
    prompt: `${STYLE}

A dark, empty theater seen from the back, rows of seats fading into shadow on either side, and
a single bright warm spotlight illuminating one small circle center-stage, with the faintest
hint of many thin dim threads of light reaching toward that circle from all across the dark
theater, as if many small sources were all sending their light into one shared, public space.

Deep theatrical darkness with one strong warm central spotlight, dramatic but calm, emphasizing
a shared, public pool of light rather than any single performer.`,
  },
  {
    name: "pagina19",
    prompt: `${STYLE}

A single composition split horizontally: the upper half shows a city seen directly from above
like a clean architectural map, rendered in cool ink linework with soft muted washes; the lower
half shows the same city seen from street level at eye height, warmer in tone, a small figure
walking among taller shapes, softly blending into the map view above through a gentle gradient
rather than a hard seam.

Cool schematic tones above blending into warmer street-level tones below, unified by one soft
gradient, illustrating two views of the same place.`,
  },
  {
    name: "pagina20",
    prompt: `${STYLE}

A dim, quiet room filled with many small, faint, softly glowing question-mark shapes drifting
like motes of light at different heights, none of them fully resolved or sharp-edged, all
rendered only in soft glowing line rather than solid form. Among them, slightly larger and
slightly warmer than the rest, one small dial or gauge glows gently, its needle resting roughly
in the middle of its arc.

Deep indigo background, many small dim glowing question shapes, one slightly warmer dial among
them, contemplative and open rather than anxious.`,
  },
  {
    name: "pagina21",
    prompt: `${STYLE}

CLOSING IMAGE. The same dog from the cover, seen once more looking directly out at the viewer
with the same calm, present gaze, but now surrounded by the full soft circular gradient of
light from the cover — cool indigo at the outer edge, warm amber-gold glow centered on the dog
— echoing the very first image of the series and closing the visual loop.

Intimate, warm, quietly luminous, centered composition, identical in spirit to the cover but
felt now as an answer rather than a question.`,
  },
];

const ai = new GoogleGenAI({ apiKey });

const RESUME_FROM = process.env.RESUME_FROM;
let resuming = !RESUME_FROM;

for (const p of PAGES) {
  if (!resuming) {
    if (p.name === RESUME_FROM) resuming = true;
    else continue;
  }
  const outPath = new URL(`../src/assets/images/phi_trampa_interruptor/${p.name}.jpg`, import.meta.url);
  if (existsSync(outPath) && !process.env.FORCE) {
    console.log(`[${p.name}] ya existe, se omite`);
    continue;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: p.prompt,
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((part) => part.inlineData?.data);
    if (!imagePart) {
      console.error(`[${p.name}] No se recibió imagen:`, JSON.stringify(response, null, 2));
      continue;
    }
    await writeFile(outPath, Buffer.from(imagePart.inlineData.data, "base64"));
    console.log(`[${p.name}] Guardada en`, outPath.pathname);
  } catch (err) {
    console.error(`[${p.name}] ERROR:`, err.message || err);
    console.error("Deteniendo generación en este punto.");
    process.exit(1);
  }
}

console.log("Listo.");
