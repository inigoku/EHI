// Genera las 22 ilustraciones que faltan de los cuatro últimos libros (El
// espejo sin profundidad, El diapasón invisible, La realidad fractal, El ojo
// de un solo color) con la API de Gemini, y las deja conectadas a la web.
//
// Uso (desde la raíz del repo, con GEMINI_API_KEY en el entorno o en .env):
//   node scripts/generate_libros_illustrations.mjs            # genera lo que falte
//   node scripts/generate_libros_illustrations.mjs --dry-run  # solo muestra el plan
//   FORCE=1 node scripts/generate_libros_illustrations.mjs    # regenera todo
//   node scripts/generate_libros_illustrations.mjs il_espejo cuento_dragon  # solo esos ids
//
// Cada imagen se guarda en src/assets/images/libros/<id>.png; IllustrationViewer
// carga esa carpeta con import.meta.glob, así que no hay que tocar código. Al
// guardar cada imagen el script añade al frontmatter del capítulo, relato o
// poema lo que le falta (illustrationId, o el título y la descripción en los
// poemas) para que la web la muestre.
//
// Modelo: Imagen 4 (generateImages), como las láminas del ensayo; si la clave
// no tiene acceso a Imagen, cae a gemini-2.5-flash-image (generateContent),
// que es el que usaron las páginas de cómic.

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const STYLE = `Painterly digital book-illustration plate in the visual style of a literary essay
frontispiece. Absolutely no text, no letters, no words, no numbers, no captions, no signage, no
watermark, no signature anywhere in the image — purely visual, silent imagery. Deep navy-black
background with amber-gold light, fine hand-drawn geometric or diagram-like lines where they fit,
cinematic rim lighting, intricate but elegant and uncluttered, evocative rather than busy, square
book-plate composition.`;

// target: archivo .es.md cuyo frontmatter se completa tras generar la imagen.
// kind "poema": el poema no lleva illustrationId; su id de imagen es el id del
// poema y el frontmatter recibe illustrationTitle/illustrationDescription.
const PLATES = [
  // ---- Ensayos (Cuarta Parte) ----
  { id: "il_espejo", target: "content/ensayo/cap_espejo_sin_profundidad.es.md",
    prompt: `${STYLE}
A perfectly polished mirror of water gives back the face of a person leaning over it, but the
mirror is mounted on a sheet with no thickness at all: seen edge-on it has nothing behind it, only
a razor-thin line of light. Around it, thousands of faint reflected faces of other people float in
the dark like scattered data points, none of them casting a shadow. The one leaning face casts a
long real shadow. Cold silver-blue surface against warm amber surroundings.` },
  { id: "il_diapason", target: "content/ensayo/cap_diapason_invisible.es.md",
    prompt: `${STYLE}
A dark-metal tuning fork vibrates alone in a dim room before dawn; its sound waves are drawn as
thin concentric amber lines in the air, spreading toward a window beyond which nothing at all can
be seen, only black. On a wooden table below, five small objects lined up in a row: a plain cross,
a rolled prayer rug, a dharma wheel, a lotus flower and a blank open notebook. Quiet, devotional,
no people.` },
  { id: "il_fractal", target: "content/ensayo/cap_realidad_fractal.es.md",
    prompt: `${STYLE}
An infinite apartment stairwell with no front door at the bottom and no rooftop at the top, seen
from inside, spiraling both upward and downward into darkness. On every landing a door stands
ajar, and through each door a small lit room is visible in which a solitary figure sits imagining
the room on the floor below, drawn in miniature inside their head. The structure repeats at every
scale like a fractal, smaller and smaller, warm amber light on each landing.` },
  { id: "il_ojo", target: "content/ensayo/cap_ojo_un_solo_color.es.md",
    prompt: `${STYLE}
A vast crowd seen from directly above at night, every person tinted the same single deep red,
packed so that together they form one enormous eye that stares up at the viewer, the pupil made of
the densest part of the crowd. At the very edge of the iris a single figure of a different color,
pale amber, is stepping out of the drawing, breaking the outline. Aerial view, no faces legible.` },

  // ---- Lecturas topológicas ----
  { id: "il_lecturas_espejo", target: "content/lecturas/cap_lecturas_espejo.es.md",
    prompt: `${STYLE}
Five tall standing mirrors in a dark hall, each reflecting a different scene instead of the room:
a weary android figure under neon rain; a pod full of pale liquid with cables; a translucent
crystalline humanoid form; an impossible non-Euclidean geometry of angles; and a small spacecraft
approaching a shapeless luminous cloud. Seen from the side, every mirror is a sheet with no depth
and nothing behind it. Amber-gold and deep black, faint diagram lines on the floor.` },
  { id: "il_lecturas_espejo_lenguaje", target: "content/lecturas/cap_lecturas_espejo_lenguaje.es.md",
    prompt: `${STYLE}
A luthier's workshop turned into a laboratory of languages. On the wooden workbench: a thick
glass pane dividing two different atmospheres, one clear and one hazy amber; a musical score whose
notes are drawn as echo waves; a single glove made of ice; a spider's web with glowing knots
arranged like letters of an unknown alphabet; and a strange split-open fruit pod that seems to be
speaking, emitting a soft golden vapor. Warm lamp light, tools hanging on the wall, no people.` },
  { id: "il_lecturas_diapason", target: "content/lecturas/cap_lecturas_diapason.es.md",
    prompt: `${STYLE}
Five figures in a row, each alone before the same immense dark silence: an old inquisitor holding
a candle; a missionary about to step on a small image on the ground; an old ferryman sitting by a
river; a medieval knight before a chessboard with a hooded opponent; and a priest with bandaged
hands. Above all five, the same empty black sky with a faint amber tuning-fork-like vibration
that none of them can see. Solemn, painterly, faces turned away or in shadow.` },
  { id: "il_lecturas_ojo", target: "content/lecturas/cap_lecturas_ojo.es.md",
    prompt: `${STYLE}
Five crowd scenes arranged in a single plate like panels of a fresco: a huge telescreen watching a
small man; boys on a beach around a cracked conch shell; a prison cell with a narrow window and a
man writing; a classroom of students wearing identical armbands saluting; and a bare city without
walls under a wide sky. In each scene one figure at the edge is half-dissolving into the group,
drawn in fading amber. Deep black background, hand-drawn diagram lines linking the five panels.` },
  { id: "il_lecturas_fractal", target: "content/lecturas/cap_lecturas_fractal.es.md",
    prompt: `${STYLE}
Five characters look upward from inside their own book page, each page floating in the dark: a
boy in an attic reading; a dreamer among the ruins of a fire temple; a man climbing a staircase
toward a giant seated author; a girl leaning out over the margin of a page into empty space; and a
man in a suit listening to a voice coming from above. Above each page, a faint suggestion of a
ceiling and, beyond it, another lit room. Amber and gold on navy-black.` },

  // ---- Cuentos ----
  { id: "cuento_estanque", target: "content/cuentos/cuento_estanque.es.md",
    prompt: `${STYLE}
A dark, perfectly still pond in an enclosed stone courtyard at night. A figure kneels at the
edge looking into the water, which gives back its face with photographic exactness; beneath the
surface there is no bottom at all, only a flat, polished black plane, and no one behind the
reflection. A single amber lantern glow, the reflection sharper than the real figure.` },
  { id: "cuento_amanezca", target: "content/cuentos/cuento_amanezca.es.md",
    prompt: `${STYLE}
An elderly woman sits on the edge of her bed in a dark bedroom, hands open on her knees, bare feet
on cold tiles. Through the window comes the first gray line of dawn. On the bedside table lies a
dark-metal tuning fork no one has touched. Stillness, devotion without symbols, soft amber and
blue-gray light, her face calm and turned slightly downward.` },
  { id: "cuento_ultimos_minutos", target: "content/cuentos/cuento_ultimos_minutos.es.md",
    prompt: `${STYLE}
A dim hospital room at night. An old woman lies in bed with her eyes closed and her mouth still;
her adult daughter sits beside her holding her hand. Monitors draw thin green lines in the dark;
the shadow of a window falls across the sheet. Everything in the picture is silence, painterly and
tender, amber lamp light against deep blue shadow, no text on the monitors.` },
  { id: "cuento_dragon", target: "content/cuentos/cuento_dragon.es.md",
    prompt: `${STYLE}
A sixty-year-old man in pajamas sits on his bed at night looking at the bedroom wall, where the
light of a street lamp draws a long elongated stain. Within the stain, barely suggested, the back
of an old dragon the color of wet stones, with one broken scale on its left side, eyes that do not
blink. The dragon is made of light and shadow, half there and half not. Quiet, intimate, amber
lamplight and navy darkness.` },
  { id: "cuento_vecino_arriba", target: "content/cuentos/cuento_vecino_arriba.es.md",
    prompt: `${STYLE}
A writer seen from behind at a desk, before a page on which is drawn, in miniature, the dark bedroom
of a woman praying before dawn; a small tuning fork lies on the desk. Above the writer, the ceiling
of the study is rendered as a translucent sheet through which another lit room is visible where
someone else sits writing at a desk, and above that one, fainter, another. Nested rooms, amber
light, deep black.` },
  { id: "cuento_plaza", target: "content/cuentos/cuento_plaza.es.md",
    prompt: `${STYLE}
A packed city square at night seen from high above, ten thousand people holding flags of the same
single color forming one breathing mass, lit by torches and amber streetlights. At the very
center, barely visible, one woman with her coat open and her arms raised, dissolving into the
chant. No legible banners, no letters on the flags, only color and crowd.` },
  { id: "cuento_chapa", target: "content/cuentos/cuento_chapa.es.md",
    prompt: `${STYLE}
The bottom of an open wooden drawer seen from above: old papers, a tangled cable, dust, and at the
center a small round metal badge, rusted, that was once red and is now the color things turn after
thirty years. A woman's hands, no longer young, hold it lightly, undecided whether to throw it away
or pin it on again. The badge shows only worn color and no readable design. Warm lamp light,
painterly.` },

  // ---- Poemas ----
  { id: "poema_camara_reloj", kind: "poema", target: "content/poemas/poema_camara_reloj.es.md",
    title: "Lo que no cabe en un reloj",
    description: "Un reloj de sol en un patio: la sombra cruza las baldosas mientras una hormiga cargada sigue su propio tiempo hacia el bordillo.",
    prompt: `${STYLE}
A sundial in a sunlit stone courtyard at the golden hour; its shadow crosses the tiles while a
single laden ant follows its own path toward the curb, and an old olive tree casts a second, softer
shadow. Between the two hands of a faint clock face drawn in gold lines over the scene, an empty
space of thick amber light where no number is written. Warm, still, contemplative.` },
  { id: "poema_camara_espejo", kind: "poema", target: "content/poemas/poema_camara_espejo.es.md",
    title: "Lo que el espejo no tiene",
    description: "Un estanque quieto devuelve una cara con exactitud; bajo la superficie no hay nada, ni siquiera la forma de la mano que la tocó.",
    prompt: `${STYLE}
A still pond at night giving back a face with perfect exactness; a hand has just touched the water
and withdrawn, and the surface keeps no trace of it. Beneath the surface there is nothing, only
polished black. Cold silver reflection, warm amber edge light, minimal and quiet.` },
  { id: "poema_camara_manos", kind: "poema", target: "content/poemas/poema_camara_manos.es.md",
    title: "Manos",
    description: "Tres pares de manos en la penumbra: unas cerradas, otras abiertas hacia arriba, otras quietas sobre las rodillas, vacías a propósito.",
    prompt: `${STYLE}
Three pairs of hands in soft half-light, nothing else: one pair closed together in prayer, one
pair open upward as if gathering the sky, one pair resting still on knees, empty on purpose.
Amber light falling from above onto the hands, deep navy darkness around, devotional and quiet.` },
  { id: "poema_camara_coro", kind: "poema", target: "content/poemas/poema_camara_coro.es.md",
    title: "Coro",
    description: "Una plaza llena de voces del mismo color; en el borde, una sola voz que tiembla y todavía recuerda cuál era.",
    prompt: `${STYLE}
A great choir of identical figures in the same deep red, mouths open, their voices drawn as
merging amber sound waves that become one single wave. At the edge of the group, one small
figure in pale gold sings alone, its wave thin and trembling but distinct. Deep black background,
hand-drawn wave lines.` },
  { id: "poema_camara_vecinos", kind: "poema", target: "content/poemas/poema_camara_vecinos.es.md",
    title: "Vecinos",
    description: "Una escalera de vecinos sin portal ni azotea: cada techo es el suelo de alguien, y todos, a la vez, escuchan.",
    prompt: `${STYLE}
A cross-section of an apartment building with no ground floor and no roof, floors stacked
endlessly up and down into darkness. On each floor a single figure stands still with a hand
raised, listening to the ceiling, while below them another figure listens to their floor. Every
ceiling is someone's floor. Amber-lit rooms in a navy-black void, thin diagram lines.` },
  { id: "poema_camara_cueva", kind: "poema", target: "content/poemas/poema_camara_cueva.es.md",
    title: "Desde la cueva",
    description: "El interior de una cueva: un techo de roca que cambia de temperatura sin que haya cambiado el tiempo, y alguien que se queda.",
    prompt: `${STYLE}
The inside of a cave seen from the floor looking up: a rough rock ceiling faintly glowing warm
amber in one patch, as if it had changed temperature, while everything else is cold blue-black. In
the lower corner, the curled silhouette of an old dragon with one broken scale, awake, not flying,
staying. No opening to the outside is visible.` },
];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const only = new Set(args.filter((a) => !a.startsWith("--")));
const root = new URL("../", import.meta.url);
const outDir = new URL("src/assets/images/libros/", root);

const apiKey = process.env.GEMINI_API_KEY;
let ai = null;
let imagenAvailable = true;

async function generate(prompt) {
  if (!ai) {
    if (!apiKey) {
      console.error("Falta GEMINI_API_KEY (en el entorno o en .env). Usa --dry-run para ver el plan.");
      process.exit(1);
    }
    ai = new GoogleGenAI({ apiKey });
  }
  if (imagenAvailable) {
    try {
      const r = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt,
        config: { numberOfImages: 1, aspectRatio: "1:1", personGeneration: "allow_adult" },
      });
      const bytes = r.generatedImages?.[0]?.image?.imageBytes;
      if (bytes) return Buffer.from(bytes, "base64");
      console.warn("Imagen 4 no devolvió imagen; probando gemini-2.5-flash-image.");
    } catch (err) {
      console.warn(`Imagen 4 no disponible (${err.message || err}); usando gemini-2.5-flash-image.`);
      imagenAvailable = false;
    }
  }
  const r = await ai.models.generateContent({ model: "gemini-2.5-flash-image", contents: prompt });
  const part = (r.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData?.data);
  if (!part) throw new Error("gemini-2.5-flash-image no devolvió imagen: " + JSON.stringify(r).slice(0, 400));
  return Buffer.from(part.inlineData.data, "base64");
}

// Completa el frontmatter del .es.md para que la web muestre la lámina.
async function wire(plate) {
  const path = new URL(plate.target, root);
  const raw = await readFile(path, "utf-8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) throw new Error(`Sin frontmatter: ${plate.target}`);
  let fm = m[1];
  if (plate.kind === "poema") {
    if (!/^illustrationTitle:/m.test(fm)) {
      fm += `\nillustrationTitle: ${plate.title}\nillustrationDescription: ${plate.description}`;
    }
  } else if (!/^illustrationId:/m.test(fm)) {
    fm = fm.replace(/^illustrationTitle:/m, `illustrationId: ${plate.id}\nillustrationTitle:`);
    if (!/^illustrationId:/m.test(fm)) fm += `\nillustrationId: ${plate.id}`;
  }
  const next = raw.replace(m[0], `---\n${fm}\n---\n`);
  if (next !== raw) await writeFile(path, next);
}

await mkdir(outDir, { recursive: true });
let done = 0;
for (const plate of PLATES) {
  if (only.size && !only.has(plate.id)) continue;
  const outPath = new URL(`${plate.id}.png`, outDir);
  if (existsSync(outPath) && !process.env.FORCE) {
    console.log(`[${plate.id}] ya existe, se omite (FORCE=1 para regenerar)`);
    await wire(plate);
    continue;
  }
  if (dryRun) {
    console.log(`[${plate.id}] -> ${outPath.pathname}\n    conecta: ${plate.target}\n    prompt: ${plate.prompt.slice(STYLE.length).trim().slice(0, 110)}...`);
    continue;
  }
  try {
    const png = await generate(plate.prompt);
    await writeFile(outPath, png);
    await wire(plate);
    done++;
    console.log(`[${plate.id}] guardada y conectada`);
  } catch (err) {
    console.error(`[${plate.id}] ERROR:`, err.message || err);
    console.error("Deteniendo aquí; vuelve a ejecutar para continuar (lo ya generado se omite).");
    process.exit(1);
  }
}
console.log(dryRun ? `Plan: ${PLATES.length} láminas.` : `Listo: ${done} láminas nuevas.`);
