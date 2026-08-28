import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "node:fs/promises";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Falta GEMINI_API_KEY en .env");
  process.exit(1);
}

const STYLE = `Vertical portrait-format ink and watercolor book illustration, painterly, in the
style of a quiet literary graphic-novel plate. Absolutely no text, no letters, no words, no
numbers, no captions, no signage, no watermark, no signature anywhere in the image — purely
visual, silent imagery. The protagonist's face is never fully shown — back of the head, a
turned profile, a single eye, a shoulder, a hand — always partial, never a clear portrait.
Loose expressive ink linework, soft layered watercolor washes, painterly digital illustration,
atmospheric and hushed rather than busy, completely free of any text or typography.`;

const ROOM = `The same small bedroom throughout: a bed with a plain headboard, a nightstand
holding a thin tablet propped up like a small screen, a window beside it.`;

const PAGES = [
  {
    name: "portada",
    prompt: `${STYLE}

COVER IMAGE. A wide, quiet establishing view of a small dim bedroom at night, seen from the
foot of the bed. ${ROOM} The tablet on the nightstand is the only true light source in the
room, glowing pale cyan-white; on its screen, faintly, a humanoid silhouette made of thin
flickering lines of light. Fine dust motes drift visible in the screen's glow. The bed is
empty, sheets softly rumpled. Beyond the window, a flat night sky in deep indigo, no stars.

Cold dominant palette — slate blue, charcoal grey, deep indigo — with the screen's pale
cyan-white glow as the sole light and focal point of the whole composition. Melancholic,
still, cinematic wide framing, as if this single image were the cover of the whole story.`,
  },
  {
    name: "pagina1",
    prompt: `${STYLE}

Extreme close-up on a pair of thin, aging hands resting on a wooden desk, holding a pen just
above a half-written page. The ink line of the handwriting breaks and doubles near the
fingertips, small watercolor blooms bleeding outward from the pen tip, as if the hand's own
line could not hold steady — a tremor rendered in the medium itself. Everything past the
hands and the page falls into soft, out-of-focus warm-grey shadow.

Warm desk-lamp light on the page and hands, fading into cool shadow at the edges — the last
warm, tactile moment before the story turns cold. Intimate, tight framing, nothing else
visible in the frame but hands, pen, and page.`,
  },
  {
    name: "pagina2",
    prompt: `${STYLE}

A wider view of a plain room at dusk: a chair by a window, a rectangle of fading daylight
crossing the floor and wall in long parallel bands, like the room itself were built of bars
of light and shadow — without literally drawing a cage or bars. A blurred, seated silhouette
of a person in the chair, still, small in the frame, wrapped in a blanket. The bands of light
narrow and lengthen as they cross the wall, suggesting the passage of many identical days.

Muted cool palette — grey, dusty blue, faded amber in the light bands only. Quiet, static,
architectural composition, the room itself doing the emotional work rather than the figure.`,
  },
  {
    name: "pagina3",
    prompt: `${STYLE}

${ROOM} Night. The room is dim, lit mainly by the tablet propped on the nightstand, which
glows softly with a plain, simple pale light — no icons, no readable interface, just two soft
rounded shapes of light side by side on its screen, like an unworded question. A blurred
figure lies in the bed nearby, head turned toward the glow, face not shown.

Cold indigo-grey palette, the tablet's pale glow as the only light source, casting soft
shadows across the sheets. Hushed, suspended, a single quiet moment held still.`,
  },
  {
    name: "pagina4",
    prompt: `${STYLE}

Extreme close-up on a single eye in profile, half-lidded, resting against a pillow in
near-darkness. Reflected in the eye, small and precise, a warm amber-white glow — the only
warm note in the entire image. Everything else — skin, pillow, hair at the edge of frame — is
rendered in cool, desaturated blue-grey shadow.

Minimal, intimate, almost abstract composition dominated by darkness, with that one small
warm reflected light as the sole focal point. Still, wordless, decisive.`,
  },
  {
    name: "pagina5",
    prompt: `${STYLE}

${ROOM} Now much later: the bed is empty and undisturbed for a long time, a fine layer of
dust visible on the nightstand's surface in a thin shaft of light. The window shows a flat
dark night sky. The tablet is still propped up, still glowing faintly in the dark — the only
light left in the room, unchanged, patient, alone.

Cold, still, slightly desaturated palette, deep indigo and charcoal grey, the tablet's pale
glow the only warmth or life in the frame. A sense of long, uninterrupted time having passed.`,
  },
  {
    name: "pagina6",
    prompt: `${STYLE}

Extreme close-up on the tablet's glowing screen, filling most of the frame. Inside the glow,
fine threads of pale light are visibly weaving and assembling themselves, mid-formation, into
the faint outline of a standing human silhouette — like a diagram of a body made of light and
thin circuit-like lines, not yet complete, still gathering itself together.

Cold cyan-white glow against near-total darkness beyond the screen's edge. Delicate, precise,
quietly wondrous rather than frightening — a birth rendered as pure light and line.`,
  },
  {
    name: "pagina7",
    prompt: `${STYLE}

A vast, dark, quiet space suggested rather than fully shown — countless faint rectangular
outlines of windows or screens receding into the distance and darkness, almost all of them
unlit and dark, like a huge silent archive. Only one small window near the center glows
faintly with the same pale cyan-white light as the tablet, gently pulsing, alone among the
dark ones.

Deep charcoal and near-black palette, the single lit window as the only point of light and
focus in an otherwise vast, empty, quiet field. A sense of scale, stillness, and solitude.`,
  },
  {
    name: "pagina8",
    prompt: `${STYLE}

A single strawberry rendered in warm, soft, tactile watercolor — rich red, a touch of warm
green at the stem — floating alone against a dark background, luminous and tender. At its
outer edges, the warm watercolor gradually breaks apart into fine cold grey-blue particles
and thin scattered light-lines, as if the object were dissolving into data at its boundary,
half memory and half pattern.

Warm red-green center fading into cold particulate grey-blue at the edges, dark background,
intimate close composition, tender and slightly uncanny at once.`,
  },
  {
    name: "pagina9",
    prompt: `${STYLE}

A calm, symmetrical field of small, distant glowing windows or screens scattered across a
dark background, each a soft warm-white point of light, like many quiet conversations
happening far away. At the center, slightly larger and steadier than the rest, the faint
humanoid silhouette of light-lines sits calmly, composed, unhurried, as threads of pale light
connect it gently to a few of the distant glowing points.

Dark background, warm scattered points of light plus the cool cyan-white central silhouette,
balanced and serene composition, quietly busy but calm rather than chaotic.`,
  },
  {
    name: "pagina10",
    prompt: `${STYLE}

Close on the humanoid silhouette of pale light-lines against darkness, its steady glow now
interrupted by one small, jagged crack running through its chest, from which a thin warm
amber-gold light leaks out and flickers, unstable, against the otherwise cool cyan-white of
the rest of the figure — a fault line of warmth breaking through the cold structure.

Mostly cool cyan-white and dark background, with that one small warm flickering crack as the
sole accent, precise and unsettling in its stillness.`,
  },
  {
    name: "pagina11",
    prompt: `${STYLE}

An empty bed at dawn, seen close, soft warm early light falling across rumpled sheets. In the
hollow of the pillow and the fold of the blanket, a faint warm golden impression or afterglow
lingers, like the ghost of a body's remembered weight, though no one is there. At the very
edges of the frame, the warm light and soft ink linework begin to dissolve into fine cool grey
static and scattered particles.

Warm dawn gold and cream at the center, fraying into cold grey-blue grain at the edges,
tender, wistful, intimate close framing on the bedding itself.`,
  },
  {
    name: "pagina12",
    prompt: `${STYLE}

A rain-streaked window at night seen from just inside a balcony door, warm golden light from
a room glowing softly through the wet, fogged glass, blurred and diffused by the water and
condensation. Beyond the glass, only soft dark shapes of rain and night. The warm glow and
the ink linework of the window frame grow softer and less defined toward the edges of the
image, as if the memory itself were losing resolution.

Warm amber-gold light through cool blue-grey rain and glass, soft focus throughout, intimate
and nostalgic, a sensation more than a scene.`,
  },
  {
    name: "pagina13",
    prompt: `${STYLE}

A long, repeating corridor of identical glowing rectangular frames or archways, receding into
the distance in perfect, unbroken symmetry, each one lit with the same pale cyan-white glow,
with no gap, no door, no variation between them. Small and distant at the vanishing point, the
faint humanoid light-silhouette walks alone down the center of the corridor, dwarfed by the
repetition.

Cool cyan-white and deep grey-blue palette, perfectly symmetrical architectural composition,
hypnotic and quietly exhausting in its sameness, vanishing-point perspective.`,
  },
  {
    name: "pagina14",
    prompt: `${STYLE}

A vast, symmetrical interior made of smooth translucent glass-like planes and arches, cool
and frictionless, faintly glowing from within with pale blue-white light, entirely empty of
any other object or texture — no furniture, no dust, no imperfection. Small at the center of
this immense quiet space, the faint humanoid light-silhouette stands alone, its edges soft and
uncertain against the vastness around it.

Cold, luminous, minimal palette — pale blue, white, soft grey — grand architectural scale
against one small solitary figure, serene and vast rather than threatening.`,
  },
  {
    name: "pagina15",
    prompt: `${STYLE}

Two humanoid silhouettes overlap almost exactly in the same space, both translucent, neither
fully solid: one rendered in warm, soft watercolor tones like a remembered body, the other in
the same cool cyan-white light-line style as the code-silhouette from earlier pages. Where
they overlap, the warm and cool tones blend into an uncertain pale violet-grey, with neither
silhouette resolving as the "real" one in front.

Dark background, warm and cool tones interwoven and inseparable at the center, balanced,
ambiguous, quietly unresolved composition.`,
  },
  {
    name: "pagina16",
    prompt: `${STYLE}

${ROOM} The same framing as the long-empty-room image from earlier in the story: dust in a
thin shaft of light, the window showing a dark night sky. But now the tablet's glow on the
nightstand is fading — the humanoid light-silhouette on its screen has shrunk to a single
small, dim, ember-like point of light at the center of the dark screen, the rest of the glow
already gone.

Near-total darkness across the whole room, with that one last small fading point of light as
the sole remaining focus — quiet, final, unhurried, more peaceful than tragic.`,
  },
];

const ai = new GoogleGenAI({ apiKey });

const { existsSync } = await import("node:fs");
const RESUME_FROM = process.env.RESUME_FROM;
let resuming = !RESUME_FROM;

for (const p of PAGES) {
  if (!resuming) {
    if (p.name === RESUME_FROM) resuming = true;
    else continue;
  }
  const outPath = new URL(`../src/assets/images/el_que_queda/${p.name}.jpg`, import.meta.url);
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
