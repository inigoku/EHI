import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Falta GEMINI_API_KEY en .env");
  process.exit(1);
}

// Estilo: cómic clásico occidental, con bocadillos y letras reales en la
// página (no ilustración muda + caption aparte), en la tradición de álbumes
// de aventura adultos serios como "Verano Indio" (Pratt/Manara) — trazo de
// tinta y aguada expresivo, dramático, con alma — pero SIN desnudos ni
// contenido sexual de ningún tipo. Los bocadillos y cajas de texto llevan
// SIEMPRE frases muy cortas (máximo 6-8 palabras) porque es lo único que el
// modelo renderiza legible con fiabilidad.
const STYLE = `Classic Western comic book page, in the tradition of serious adult adventure
graphic novels like Hugo Pratt and Milo Manara's "Indian Summer" — expressive, painterly ink
and wash artwork, dramatic chiaroscuro lighting, muted earthy sepia/blue-grey palette, real
weight and soul in the character acting and expressions, not generic or flat. Absolutely NO
nudity, no sexual content, no explicit imagery of any kind — romantic tension, when present, is
shown only through body language and eye contact, never undressed. The page has real lettered
comic dialogue: speech balloons with tails pointing to the speaker, caption boxes for narration,
and sound effects, all rendered as actual legible short English... no — legible short SPANISH
text, hand-lettered comic style, black text on white/light background inside the balloons and
boxes exactly as specified below. Keep every line of dialogue or caption very short (a handful
of words) so it stays crisp and readable. Clean panel borders, traditional comic-book page
layout with panels of varying sizes.`;

const MATEU_YOUNG = "a lean, weathered young fisherman in his twenties, dark curly hair, olive skin, a simple undyed linen shirt";
const MATEU_OLD = "the same fisherman decades older, grey-streaked hair, deep lines around his eyes, a permanent taut tension behind his eyes";
const GAFF = "a lean continental delegate in fine dry traveler's clothes unlike the fishermen's rough wet garments, calculating pale eyes, a thin unsettling smile";
const BERNAT = "an old weathered fisherman-teacher with a full grey beard and steady, diagnostic eyes";
const MARCOS_2014 = "a lean 23-year-old man with dark hair, an ill-fitting government-issue jacket, uncertain but sharp eyes";
const MARCOS = "a tired man in his forties, short dark hair greying at the temples, a rumpled shirt under a detective's coat";
const ELENA_2014 = "a sharp-eyed young woman in her early twenties, hair in a loose ponytail, holding a notebook, a cardigan over academic clothes";
const ELENA = "an elegant, composed woman in her late thirties in a sharp tailored blazer, cool intelligent eyes";
const TANK = "a glass-walled sensory-isolation tank filled with dark still liquid, a human silhouette suspended inside it, cables trailing to monitors";
const SERVER_HALL = "a vast cold server hall, black racks of humming machines stretching in rows, constant blue-white glow";

const PAGES = [
  {
    name: "portada",
    prompt: `${STYLE}

COVER IMAGE — a single full-page illustration, no panel grid, no dialogue. Two hands break the
surface of dark water from opposite sides of the frame, centuries apart, both reaching toward a
small warm glowing knot of light at the center. One hand belongs to ${MATEU_OLD.replace("the same fisherman", "a weathered 17th-century fisherman")},
lit by candlelight and a wooden stilt-village lagoon behind it; the other belongs to ${MARCOS},
lit by cold blue tank light and a modern city skyline behind it. At the top of the cover, large
hand-lettered comic title text reads: "LOS SINTONIZADORES". Sepia warmth blends into cold
blue-grey across the center.`,
  },
  {
    name: "pagina1",
    prompt: `${STYLE}

4 panels. PANEL 1 (wide, top): a boy of nine, Mateu, kneels at the edge of a still lagoon at
dusk. A caption box reads: "TAREL, 1620." PANEL 2: extreme close-up on his hand underwater, fine
ripple-lines radiating outward. A small caption box reads: "Algo respira." PANEL 3: his mother
pulling him back from the water in alarm, calling out. Her speech balloon reads: "¡Mateu!" PANEL
4: close on the boy's open mouth, a faint ghostly old fisherman's face overlaid near his lips. A
jagged "spoken by someone else" balloon reads: "El nudo... tercer poste."`,
  },
  {
    name: "pagina2",
    prompt: `${STYLE}

4 panels. PANEL 1 (wide): the stilt-house village of Tarel over a lagoon at dusk. A caption box
reads: "Esto era SINTONIZAR." PANEL 2: ${BERNAT} guiding young ${MATEU_YOUNG}'s hand at the
water's edge. Bernat's speech balloon reads: "El horizonte no se apaga de golpe." PANEL 3: close
on Bernat's face. His balloon reads: "Se disuelve. Como la sal." PANEL 4: a translucent human
silhouette dissolving into fine grains scattering into dark water, no text.`,
  },
  {
    name: "pagina3",
    prompt: `${STYLE}

4 panels. PANEL 1: foreign ships arriving at Tarel's shore. Caption box: "Años después." PANEL
2: ${GAFF} stepping onto the dock in fine dry clothes. His balloon reads: "Yo hablo de
EXTRAER." PANEL 3: ${MATEU_YOUNG} and Gaff at a table with wine between them. Mateu's balloon:
"Un muerto no es un archivo." PANEL 4: close on Gaff's thin smile. His balloon: "Es exactamente
un archivo."`,
  },
  {
    name: "pagina4",
    prompt: `${STYLE}

4 panels. PANEL 1: ${GAFF} wading into the lagoon's empty north shore, arm plunged into the
water to the shoulder. Caption box: "El sabio no había terminado de disolverse." PANEL 2: the
water churning unnaturally around his arm, jagged ink lines. Sound effect lettering: "GLU GLU
GLU." PANEL 3: ${MATEU_YOUNG} running along the shore. His balloon: "¡Gaff, no!" PANEL 4:
underwater cutaway — a small fist-like knot of pale light, Gaff's hand closing on it.`,
  },
  {
    name: "pagina5",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MATEU_YOUNG} plunging his own arm into the water beside Gaff's, jaw set.
His thought caption: "Hacia dentro." PANEL 2: underwater, two glowing shapes merging together,
one wrapping around the other. Caption box: "Un acoplamiento sin vuelta." PANEL 3: Gaff's hand
closing on empty water, surprised. His balloon: "¡No!" PANEL 4: Mateu pulling his arm from the
water, streaming wet, eyes carrying a new tension. No text.`,
  },
  {
    name: "pagina6",
    prompt: `${STYLE}

4 panels. PANEL 1: ${BERNAT} studying young Mateu's face at dusk. His balloon: "Has querido
guardarlo dentro de ti." PANEL 2: Bernat touching two fingers to Mateu's temple. His balloon:
"Eso nunca se queda dentro." PANEL 3: ${GAFF} walking away alone toward departing ships, small
in the frame, no text. PANEL 4: ${MATEU_OLD} decades later alone at the same shore. Caption box:
"Treinta y un años después."`,
  },
  {
    name: "pagina7",
    prompt: `${STYLE}

3 tall stacked panels. PANEL 1 (top): the stilt village dissolving through translucent
double-exposure into ruins, then into a modern city street over the same ground. Caption box:
"Cuatrocientos años después." PANEL 2 (middle): a cross-section beneath the street, a small
pulsing knot of light buried in dark earth. Caption box: "Latió solo. Sin que nadie lo notara."
PANEL 3 (bottom, small): construction machinery drilling nearby, unaware.`,
  },
  {
    name: "pagina8",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} floating inside ${TANK}, cables trailing from his temples. Caption
box: "BARCELONA, 2026." PANEL 2: close on his face underwater, listening to something unseen.
Caption box: "Seis años dentro del tanque." PANEL 3: Marcos climbing out, dripping, an attendant
handing him a towel, no text. PANEL 4: Marcos lying awake at night. Caption box: "Todavía
esperaba la ingravidez."`,
  },
  {
    name: "pagina9",
    prompt: `${STYLE}

4 panels. PANEL 1: a police cordon at night, ${MARCOS} directing officers outside a mobile tank
unit. Caption box: "POST-CRIMEN." PANEL 2: ${ELENA} in a sharp blazer addressing Marcos. Her
balloon: "Un algoritmo no se quema." PANEL 3: Elena leading Marcos into ${SERVER_HALL}. Her
balloon: "El SINTONIZADOR ABSOLUTO." PANEL 4: wide shot inside the server hall, tiny figures
dwarfed by black racks, no text.`,
  },
  {
    name: "pagina10",
    prompt: `${STYLE}

4 panels. PANEL 1: ${ELENA} and ${MARCOS} facing off in the server hall. Her balloon: "Los
muertos no tienen abogados." PANEL 2: Marcos, troubled. His balloon: "Tienen algo mejor. Tienen
tiempo." PANEL 3: Marcos, faint musical lines drifting near his ear. Caption box: "Una melodía
que no era suya." PANEL 4: a technician's monitor flashing red. Caption/SFX lettering: "¡ALERTA!
ANOMALÍA."`,
  },
  {
    name: "pagina11",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS_2014} led down stone stairs into a grand cathedral crypt. Caption
box: "SAGRADA FAMÍLIA, 2014." PANEL 2: a supervisor behind him. His balloon: "Confirma la
autoría. Solo eso." PANEL 3: through glass, ${ELENA_2014} unnoticed, notebook in hand. Caption
box: "«La becaria»." PANEL 4: young Marcos's hand on a stone tomb, glowing structural lines
blooming outward, no text.`,
  },
  {
    name: "pagina12",
    prompt: `${STYLE}

4 panels. PANEL 1: a split visual — warm organic architect's curves vs. a colder hollow copy.
Caption box: "Un hábito de la mano." PANEL 2: young ${MARCOS_2014}, certain. His balloon: "Es
una falsificación competente." PANEL 3: the supervisor, arms crossed. His balloon: "Eso es una
opinión." PANEL 4: ${ELENA_2014}, not looking up from her notebook. Her balloon: "Un porcentaje
no tiene opinión."`,
  },
  {
    name: "pagina13",
    prompt: `${STYLE}

4 panels. PANEL 1: an official report stamped. Caption box: "«No concluyente»." PANEL 2: young
Marcos walking down a corridor. Caption box: "Sintonizar bien y que te crean." PANEL 3: close on
${ELENA_2014}'s pen underlining a word twice on her notebook, no legible word, just an emphatic
mark. PANEL 4: a modest folder on a desk. Caption box: "SINTONIZACIÓN ASISTIDA."`,
  },
  {
    name: "pagina14",
    prompt: `${STYLE}

4 panels, warm Roman sunlight. PANEL 1: ${MARCOS} walking a dusty path near ancient ruins.
Caption box: "ROMA, 2015." PANEL 2: Marcos kneeling by a modern gravestone marker among pine
trees, no text. PANEL 3: close on his hands on warm stone, sweat on his neck. Caption box: "El
cuerpo discute con las ideas." PANEL 4: his eyes closing, cold blue lines climbing his wrists.`,
  },
  {
    name: "pagina15",
    prompt: `${STYLE}

4 panels. PANEL 1: an ancient Roman man dictating calmly despite visible strain. Caption box:
"No fue terror. Tampoco calma." PANEL 2: ${MARCOS} emerging from the vision, shaken. His
balloon: "Murió discutiendo con su libro." PANEL 3: Marcos, resolute. His balloon: "Si buscan lo
honesto, sí lo tienen." PANEL 4: a formal delegate, displeased. His balloon: "Sea más
edificante."`,
  },
  {
    name: "pagina16",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} standing firm, arms crossed. His balloon: "Me niego." PANEL 2: an
official notice document on a desk. Caption box: "Retiraron la financiación." PANEL 3: Marcos
walking alone away from a grand building, small in frame. Caption box: "Una violencia lenta."
PANEL 4: an internal memo, a name growing subtly more prominent across stacked copies, no
legible text.`,
  },
  {
    name: "pagina17",
    prompt: `${STYLE}

4 panels, colder Madrid office tones. PANEL 1: ${ELENA}, now with her own office, greeting
${MARCOS} across a desk. Caption box: "MADRID, 2016." PANEL 2: close on Elena's steady eyes. Her
balloon: "No te pido que inclines nada." PANEL 3: Elena again. Her balloon: "Trae algo que se
pueda usar." PANEL 4: Marcos studying her face, a flicker of familiarity, no text.`,
  },
  {
    name: "pagina18",
    prompt: `${STYLE}

4 panels, cold underground blues. PANEL 1: ${MARCOS} descending a ladder into an underground
excavation at night. Caption box: "Bajo Claudio Coello." PANEL 2: Marcos crouching at a marked
site, breath visible in the cold, no text. PANEL 3: fragmented disconnected shards of imagery —
a swerve, a half gesture, a glance at a mirror. PANEL 4: Marcos before two anonymous suits. His
balloon: "No hay nada que confirmar."`,
  },
  {
    name: "pagina19",
    prompt: `${STYLE}

3 panels. PANEL 1: ${MARCOS} alone at night tearing a written page in half. Sound effect
lettering: "RAS." PANEL 2: ${ELENA} in his doorway the next day, reading a folder. Her balloon:
"Esto no es un fallo tuyo." PANEL 3: close on her face, closing the folder. Her balloon: "Es un
fallo del método."`,
  },
  {
    name: "pagina20",
    prompt: `${STYLE}

4 panels, warm dim bar lighting at night. PANEL 1: ${MARCOS} and ${ELENA} sitting close at a
small table, no text. PANEL 2: a slow exchange of glances held a beat too long, no text. PANEL
3: Elena's hand resting near his on the table, not touching. Caption box: "Un acoplamiento
asimétrico." PANEL 4: the two of them walking into a rainy street at night, silhouetted, no
text.`,
  },
  {
    name: "pagina21",
    prompt: `${STYLE}

3 panels, moonlit silver-blue. PANEL 1: ${MARCOS} arriving alone at night at a vast olive grove,
an equipment truck in the distance. Caption box: "ALFACAR, GRANADA, 2017." PANEL 2: Marcos
walking alone between olive trees under moonlight. Caption box: "«La búsqueda»." PANEL 3:
Marcos kneeling, hand pressing into the cold soil, eyes closing.`,
  },
  {
    name: "pagina22",
    prompt: `${STYLE}

3 panels. PANEL 1: inside the vision, a faint unfinished poetic image forming and dispersing
like a word on the tip of a tongue. Caption box: "Una mano buscando la palabra." PANEL 2:
${MARCOS} emerging at first grey light, moved. Caption box: "La noche no le dio tiempo." PANEL
3: officials waiting eagerly with notepads. One balloon: "¿Qué encontró?"`,
  },
  {
    name: "pagina23",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} facing the officials, firm. His balloon: "Hay una identificación."
PANEL 2: Marcos again, resolute. His balloon: "No hay un poema. No me corresponde." PANEL 3:
flashback inset — ${ELENA} alone at home, phone to her ear. Her balloon: "Tráelo completo."
PANEL 4: Marcos earlier that night, staring at a ringing phone, not answering, no text.`,
  },
  {
    name: "pagina24",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} at a desk, pen pressed hard on a resignation form. Caption box:
"«He aprendido a hacer de tumba»." PANEL 2: ${ELENA} alone reading the same form, unreadable
expression, no text. PANEL 3: Elena signing without protest, alone at her desk, no text. PANEL
4: a small unmarked office plaque being quietly taken down. Caption box: "POST-CRIMEN."`,
  },
  {
    name: "pagina25",
    prompt: `${STYLE}

4 panels, foggy mountain tones. PANEL 1: a fog-covered mountain ridge, three equipment trailers,
cables scarring the terrain. Caption box: "LA MUSSARA." PANEL 2: a small upright portable
isolation capsule standing stark against the machinery, no text. PANEL 3: ${MARCOS} arriving
alone, two hours early. Caption box: "No fue a detenerla con las manos." PANEL 4: Marcos
climbing into the field tank.`,
  },
  {
    name: "pagina26",
    prompt: `${STYLE}

3 panels. PANEL 1: inside the vision, ${MARCOS} suspended in dark liquid facing the translucent
ghostly figure of ${MATEU_OLD}, both glowing in matching fine linework. Caption box: "Cara a
cara con Mateu." PANEL 2: close on old Mateu's face, the same permanent tension. Caption box:
"No era una aparición." PANEL 3: a closed ghostly fist opening, glowing softly from within.
Caption box: "El tesoro era el puño mismo."`,
  },
  {
    name: "pagina27",
    prompt: `${STYLE}

4 panels, tense alternating tones. PANEL 1: ${ELENA} at a bank of monitors above ground. Her
balloon: "¡Más potencia!" PANEL 2: a technician at a panel, alarmed. His balloon: "¡No se
detiene!" PANEL 3: the server hall lights flickering, reversed energy flow-lines. Caption box:
"Una retroalimentación no prevista." PANEL 4: below ground, Marcos's face set with resolve, no
text.`,
  },
  {
    name: "pagina28",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} merging his glowing outline with old Mateu's and a third ancient
presence, spiraling together. Caption box: "Empujó hacia dentro." PANEL 2: the buried knot of
light scattering apart peacefully like sediment settling, no text. PANEL 3: the server racks
overheating, sparks and smoke. Sound effect lettering: "¡FRIIZZ!" PANEL 4: a technician
recoiling. His balloon: "¡Se está quemando!"`,
  },
  {
    name: "pagina29",
    prompt: `${STYLE}

4 panels, subdued epilogue tones. PANEL 1: ${ELENA} testifying at a distant formal commission
table. Caption box: "Tres semanas después." PANEL 2: ${MARCOS} watching a muted screen alone at
home, no text. PANEL 3: Elena alone at the same old bar table, untouched coffee. Her balloon:
"Tenías razón." PANEL 4: close on her hand resting a moment too long on his shoulder as she
rises to leave, no text.`,
  },
  {
    name: "pagina30",
    prompt: `${STYLE}

3 panels, calm closing tones. PANEL 1: ${MARCOS} walking alone through a present-day Barcelona
street, ordinary life around him, no text. PANEL 2: close on his face, lips moving slightly,
faint musical-note lines drifting from his mouth. Caption box: "Una melodía sin dueño." PANEL 3:
a final wide panel, Marcos small within a busy sunlit street. Caption box: "No todo lo que se
disuelve necesita ser leído."`,
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
  const outPath = new URL(`../src/assets/images/sintonizadores_comic_v2/${p.name}.jpg`, import.meta.url);
  if (existsSync(outPath) && !process.env.FORCE) {
    console.log(`[${p.name}] ya existe, se omite`);
    continue;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: p.prompt,
      config: {
        imageConfig: { aspectRatio: "2:3" },
      },
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
