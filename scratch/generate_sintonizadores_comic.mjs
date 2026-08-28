import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Falta GEMINI_API_KEY en .env");
  process.exit(1);
}

const STYLE = `Comic book page, portrait format, laid out as a clean sequential grid of multiple
panels (unless stated otherwise), in the tradition of sophisticated European adult graphic
novels — fine confident ink linework, dramatic noir chiaroscuro lighting, elegant naturalistic
figure work and body language, sober muted color palette (charcoal, sepia, cold blue-grey,
occasional warm amber lamplight) that shifts with each era of the story. Absolutely NO nudity,
no sexual content, no explicit imagery of any kind — any romantic tension is shown only through
body language, eye contact, and restrained physical closeness (a hand resting near a shoulder, a
look held a beat too long), never undressed, never intimate beyond that. Absolutely no legible
text, no lettering, no readable words, no speech bubbles with writing inside them, no captions
baked into the image anywhere — every panel is purely visual and silent, panel borders are thin
clean ink rules with no text between them.`;

const MATEU_YOUNG = "a lean, weathered young fisherman in his twenties, dark curly hair, olive skin, a simple undyed linen shirt, calloused hands";
const MATEU_OLD = "the same fisherman decades older, grey-streaked hair, deep lines around his eyes, a permanent taut tension visible behind his eyes";
const GAFF = "a lean continental delegate in fine dry traveler's clothes utterly unlike the fishermen's rough wet garments, calculating pale eyes, a thin unsettling smile";
const BERNAT = "an old weathered fisherman-teacher with a full grey beard and steady, diagnostic eyes";
const MARCOS_2014 = "a lean 23-year-old man with dark hair, an ill-fitting government-issue jacket, uncertain but sharp eyes";
const MARCOS = "a tired man in his forties, short dark hair greying at the temples, a rumpled shirt under a detective's coat, eyes that seem to focus on something just past the viewer";
const ELENA_2014 = "a sharp-eyed young woman in her early twenties, hair in a loose ponytail, holding a notebook, a cardigan over academic clothes";
const ELENA = "an elegant, composed woman in her late thirties in a sharp tailored blazer, ambitious posture, cool intelligent eyes";
const TANK = "a glass-walled sensory-isolation tank filled with dark still liquid, a human silhouette suspended inside it, cables trailing to monitors";
const SERVER_HALL = "a vast cold server hall, black racks of humming machines stretching in rows, a constant blue-white glow, like a building within a building";

const PAGES = [
  {
    name: "portada",
    prompt: `${STYLE}

COVER IMAGE — a single full-page illustration, not a panel grid. Two hands break the surface
of dark water from opposite sides of the frame, centuries apart, both reaching toward the same
small, warm, glowing knot of light suspended at the center of the water. One hand belongs to
${MATEU_OLD.replace("the same fisherman", "a weathered 17th-century fisherman")}, faintly
lit by candlelight and a wooden stilt-village lagoon behind it; the other belongs to
${MARCOS}, faintly lit by cold blue tank light and a modern city skyline behind it. The two
halves of the composition blend seamlessly into one image, sepia warmth bleeding into cold
blue-grey across the center.

Symmetrical, dreamlike, elegant composition, the glowing knot of light at the exact center as
the sole focal point.`,
  },
  {
    name: "pagina1",
    prompt: `${STYLE}

4 panels. PANEL 1: a boy of nine, Mateu, kneels at the edge of a still lagoon at dusk, reaching
one hand into the water. PANEL 2: extreme close-up on his small hand underwater, fine
concentric ripple-lines radiating outward like a plucked string. PANEL 3: his mother pulling
him back from the water in alarm, his body limp and trembling. PANEL 4: close on the boy's
open mouth, a faint ghostly overlay of an old fisherman's face barely visible near his lips, as
words that are not his own come out.`,
  },
  {
    name: "pagina2",
    prompt: `${STYLE}

4 panels. PANEL 1: a wide establishing view of Tarel, a wooden stilt-house village built over a
brackish lagoon, warm lantern light at dusk. PANEL 2: ${MATEU_YOUNG} kneeling at the water's
edge with ${BERNAT}, Bernat's weathered hand guiding the young man's hand toward the surface.
PANEL 3: close on Bernat's stern, warm face, mid-lesson. PANEL 4: a symbolic panel — a
translucent human silhouette dissolving gradually into fine salt-like grains scattering into
dark water.`,
  },
  {
    name: "pagina3",
    prompt: `${STYLE}

4 panels. PANEL 1: foreign sailing ships arriving at Tarel's wooden shore, villagers watching
warily. PANEL 2: ${GAFF} stepping off a boat onto the dock, his fine dry clothes and posture
utterly foreign among the wet fishermen. PANEL 3: ${MATEU_YOUNG} and Gaff seated across a small
table at night, an open bottle of wine between them like an uneasy truce. PANEL 4: close-up on
Gaff's hands resting on the table, showing the same fine involuntary tremor Mateu recognizes
from his own trade.`,
  },
  {
    name: "pagina4",
    prompt: `${STYLE}

4 panels. PANEL 1: ${GAFF} wading into the lagoon at its empty northern shore under a grey sky,
plunging his arm into the water up to the shoulder. PANEL 2: the water churning and boiling
unnaturally around his submerged arm, sharp jagged ink lines cutting through the otherwise calm
lagoon surface. PANEL 3: ${MATEU_YOUNG} running along the shore, alarmed, having just arrived.
PANEL 4: a cutaway view beneath the water's surface — a small fist-like knot of ghostly pale
light, not yet dissolved, with Gaff's hand closing in on it.`,
  },
  {
    name: "pagina5",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MATEU_YOUNG} plunging his own arm into the water right beside Gaff's, jaw
set with sudden decision. PANEL 2: underwater, two translucent glowing shapes — Mateu's own
warm outline, and the sage's smaller fist-like knot of light — merging together, one wrapping
protectively around the other. PANEL 3: Gaff's hand closing on empty water a moment too late,
his face registering genuine surprise. PANEL 4: Mateu pulling his arm from the water, streaming
wet, his eyes now carrying a new, permanent, unfamiliar tension.`,
  },
  {
    name: "pagina6",
    prompt: `${STYLE}

4 panels. PANEL 1: ${BERNAT} and young Mateu standing together at the shore at dusk, Bernat
studying the young man's face closely and gravely. PANEL 2: Bernat pressing two fingers gently
to Mateu's temple, a diagnostic, almost clinical gesture. PANEL 3: ${GAFF} walking away alone
toward departing ships at the horizon, small and solitary in the frame. PANEL 4: a final wide
panel — ${MATEU_OLD} decades later, alone at the same shore at dusk, the same tension still
behind his eyes, the unchanged village silhouette behind him.`,
  },
  {
    name: "pagina7",
    prompt: `${STYLE}

3 panels, wide and tall, showing the passage of centuries. PANEL 1 (top, wide): the wooden
stilt village of Tarel, dissolving through translucent double-exposure linework into ruins,
and then into a modern paved city street built over the exact same ground — three eras layered
into one seamless image. PANEL 2 (middle): a cross-section beneath the modern street, showing
a small pulsing knot of pale light buried undisturbed in the dark earth. PANEL 3 (bottom,
small inset): modern construction machinery drilling nearby on the surface, entirely unaware
of what lies just beneath.`,
  },
  {
    name: "pagina8",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} floating inside ${TANK}, dark liquid, fine cables trailing from
his temples. PANEL 2: close on his face underwater, eyes open and unfocused, listening to
something unseen. PANEL 3: Marcos climbing out of the tank, dripping, an attendant handing him
a towel, his eyes still fixed on something distant. PANEL 4: Marcos lying awake at night in a
plain apartment, staring at the ceiling, his skin visibly still expecting the water's
weightlessness.`,
  },
  {
    name: "pagina9",
    prompt: `${STYLE}

4 panels. PANEL 1: a police cordon at night, ${MARCOS} as inspector directing officers outside
a mobile tank unit where another sintonizador is submerging. PANEL 2: ${ELENA} in a sharp
blazer, addressing Marcos with clinical confidence, clipboard in hand. PANEL 3: Elena leading
Marcos through a heavy door into ${SERVER_HALL}, cold blue-white light spilling out. PANEL 4: a
wide shot inside the server hall, the two of them tiny figures dwarfed by endless black racks
of humming machines.`,
  },
  {
    name: "pagina10",
    prompt: `${STYLE}

4 panels. PANEL 1: ${ELENA} and ${MARCOS} facing each other inside the server hall, tense
disagreement visible in their posture. PANEL 2: close on Elena's face, certain and unflinching,
mid-sentence. PANEL 3: Marcos looking away, troubled, faint thin musical-note-like lines
drifting unbidden near his ear, a melody he didn't choose to hear. PANEL 4: a technician's
monitor screen glowing with a sharp red anomaly alert pulsing at its center, no legible text on
it, just an alarming shape of light.`,
  },
  {
    name: "pagina11",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS_2014} being led down a narrow stone staircase into the crypt of a
grand unfinished cathedral (Sagrada Família-like architecture), a supervisor ahead of him.
PANEL 2: through a pane of glass behind them, ${ELENA_2014} visible in the background, notebook
in hand, unnoticed by everyone else in the room. PANEL 3: young Marcos sitting beside a stone
tomb, resting his hand flat against it. PANEL 4: his eyes closing as he enters the
sintonización, faint glowing structural lines — arches, catenary curves — blooming outward from
his hand across the stone.`,
  },
  {
    name: "pagina12",
    prompt: `${STYLE}

4 panels. PANEL 1: a split visual comparison — on the left, glowing warm organic structural
curves (bone-like, tree-like, wave-like) representing a master architect's true instinct; on
the right, a colder, competent but hollow copy of the same curve, drawn from a paper fragment.
PANEL 2: ${MARCOS_2014} opening his eyes, certain of what he found. PANEL 3: the supervisor,
unimpressed, arguing back with crossed arms. PANEL 4: ${ELENA_2014} speaking for the first
time, not looking up from her notebook, calm and precise.`,
  },
  {
    name: "pagina13",
    prompt: `${STYLE}

4 panels. PANEL 1: an official report document being stamped with an inconclusive seal (an
abstract stamp shape, no legible text). PANEL 2: young Marcos walking away down a long stone
corridor, shoulders tense with the compromise. PANEL 3: close on ${ELENA_2014} alone, pen
pressed to her notebook, underlining something twice — shown only as an abstract emphasized
ink mark, not legible text. PANEL 4: a small modest university project folder resting on a
desk, an understated professional insignia on its cover, unassuming.`,
  },
  {
    name: "pagina14",
    prompt: `${STYLE}

4 panels, warm Roman sunlight tones. PANEL 1: ${MARCOS} walking a dusty sunlit path near ancient
ruins, heat shimmer rendered as fine wavy linework rising from the ground. PANEL 2: Marcos
kneeling beside a modern gravestone marker among pine trees. PANEL 3: close on his hands
pressed to the warm stone, sweat visible on the back of his neck. PANEL 4: his eyes closing as
he enters the sintonización, a cold blue seeping visual climbing over the warm ochre tones from
his wrists upward.`,
  },
  {
    name: "pagina15",
    prompt: `${STYLE}

4 panels. PANEL 1: inside the sintonización, a historical flashback rendered in softer, older
linework — an ancient Roman man dictating calmly to a scribe despite visible physical strain,
time moving slowly around him. PANEL 2: close on that man's face — not fear, not perfect calm
either, something unresolved between the two. PANEL 3: ${MARCOS} emerging from the
sintonización, shaken, choosing his next words carefully. PANEL 4: a formally dressed delegate's
face, displeased, gesturing as if requesting a more flattering account.`,
  },
  {
    name: "pagina16",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} standing firm, arms crossed, the delegate's face hardening in
front of him. PANEL 2: an official notice of withdrawn funding being set down on a desk, shown
only as a stamped document shape with no legible text. PANEL 3: Marcos walking alone away from
a grand institutional building, small and isolated in the wide frame. PANEL 4: a small inset
panel — an internal memo document, a name growing subtly more prominent across several stacked
overlapping copies of it, though never legible, unnoticed by Marcos.`,
  },
  {
    name: "pagina17",
    prompt: `${STYLE}

4 panels, Madrid, colder office tones. PANEL 1: a formal office, ${ELENA} now with her own desk
and title, greeting ${MARCOS} across it — she looks older and sharper than before, though he
doesn't recognize her yet. PANEL 2: close on Elena's steady, unblinking eyes as she speaks.
PANEL 3: Marcos studying her face, a flicker of unplaced familiarity crossing his own. PANEL 4:
a folder passing between their hands across the desk, an old newspaper photo motif of a bombed
street just visible on its cover, tasteful and non-graphic.`,
  },
  {
    name: "pagina18",
    prompt: `${STYLE}

4 panels, cold underground blues. PANEL 1: ${MARCOS} descending a ladder into an underground
excavation site beneath a Madrid street at night, breath visible in the cold. PANEL 2: Marcos
crouching at a marked site on the exposed earth, generator light nearby. PANEL 3: the
sintonización shown as fragmented disconnected shards of imagery — a swerve, a half-formed
gesture, a glance at a mirror — rather than one coherent scene. PANEL 4: Marcos standing before
two anonymous suited figures on either side of him, delivering a flat, guarded verdict.`,
  },
  {
    name: "pagina19",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} alone at night in a plain hotel room, hunched over a desk, writing
by lamplight. PANEL 2: close on his hands tearing a written page cleanly in half, no legible
text visible, just the gesture. PANEL 3: ${ELENA} standing in his office doorway the next day,
reading a folder, her expression sharpening. PANEL 4: close on her face as she closes the
folder with a decisive gesture, mid-sentence.`,
  },
  {
    name: "pagina20",
    prompt: `${STYLE}

4 panels, warm dim bar lighting at night. PANEL 1: ${MARCOS} and ${ELENA} sitting close at a
small table in a dim bar, both looking slightly away from each other, unresolved tension in
their posture. PANEL 2: a slow exchange of glances across the table, held a beat too long.
PANEL 3: Elena's hand resting on the table near his, not quite touching, both very aware of the
gap. PANEL 4: the two of them walking out together into a rainy street at night, seen from
behind in silhouette, keeping a respectful but charged distance between them.`,
  },
  {
    name: "pagina21",
    prompt: `${STYLE}

4 panels, moonlit silver-blue tones. PANEL 1: ${MARCOS} arriving alone at night at a vast olive
grove, an equipment truck parked in the distance, its engine off. PANEL 2: Marcos walking alone
between rows of olive trees under near-full moonlight, tense silence suggested by small
scattered motion-lines. PANEL 3: Marcos kneeling on the cold earth between the trees. PANEL 4:
his open hand pressing flat into the soil as he closes his eyes, entering the sintonización.`,
  },
  {
    name: "pagina22",
    prompt: `${STYLE}

4 panels. PANEL 1: inside the sintonización, a faint unfinished poetic image forming in pale
light — an abstract half-formed shape that keeps almost resolving into something recognizable
before dispersing again, like a word on the tip of a tongue. PANEL 2: ${MARCOS}'s face inside
the vision, moved and quietly protective. PANEL 3: Marcos emerging from the sintonización at
first grey light of dawn, the olive trees now visible around him. PANEL 4: officials waiting
eagerly nearby with notepads raised, expectant.`,
  },
  {
    name: "pagina23",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} facing the officials, standing firm and refusing to elaborate
further. PANEL 2: close on his mouth mid-sentence, resolute. PANEL 3: a flashback inset —
${ELENA} alone in her home the night before, phone held to her ear, speaking earnestly. PANEL
4: Marcos earlier that same night in the olive grove, staring at a ringing phone in his hand,
choosing not to answer.`,
  },
  {
    name: "pagina24",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} at a desk filling out a resignation form, pen pressed hard into
the paper, a heavily underlined final line shown only as an abstract emphatic ink mark. PANEL
2: ${ELENA} alone in her office reading the same form, expression unreadable. PANEL 3: Elena
signing the paperwork without protest, alone at her desk. PANEL 4: a small unmarked office
plaque being quietly taken down by an unseen hand, symbolizing a division's quiet end.`,
  },
  {
    name: "pagina25",
    prompt: `${STYLE}

4 panels, foggy mountain tones. PANEL 1: a wide view of a fog-covered mountain ridge, three
large equipment trailers and a scar of cables running across the terrain. PANEL 2: a small
upright portable isolation capsule standing stark and solitary against the machinery around
it. PANEL 3: ${MARCOS} arriving alone, two hours early, glancing around before approaching
unauthorized. PANEL 4: Marcos climbing into the field tank, his skin already anticipating the
coming weightlessness.`,
  },
  {
    name: "pagina26",
    prompt: `${STYLE}

4 panels. PANEL 1: inside the sintonización, ${MARCOS} suspended in dark liquid, and facing him
in the same space, the translucent ghostly figure of ${MATEU_OLD}, both rendered in matching
fine glowing linework as if sharing one place across centuries. PANEL 2: close on old Mateu's
face, carrying the exact same permanent tension Marcos recognizes in his own reflection. PANEL
3: a wordless exchange between them, their two glowing outlines touching gently at the edges.
PANEL 4: a closed ghostly fist slowly opening, revealing not an object but simply more soft
light glowing from within the open palm.`,
  },
  {
    name: "pagina27",
    prompt: `${STYLE}

4 panels, tense alternating warm/cold tones. PANEL 1: above ground, ${ELENA} directing the
extraction at a bank of monitors, technicians tense around her. PANEL 2: the server hall's
lights flickering, alarming reversed flow-lines of energy pushing back against the machine
racks. PANEL 3: close on Elena's face, confidence flickering into doubt as readouts spike.
PANEL 4: below ground, ${MARCOS} still submerged, his face set with quiet resolve, making his
choice.`,
  },
  {
    name: "pagina28",
    prompt: `${STYLE}

4 panels. PANEL 1: ${MARCOS} deliberately merging his own glowing outline with old Mateu's and
a third, older ghostly presence, all three spiraling together into one bright dissolving mass
of light. PANEL 2: underground, the ancient buried knot of light finally scattering apart
peacefully, like fine sediment settling rather than being torn. PANEL 3: the machine's
extraction cables reaching into now-empty space, finding nothing left to pull. PANEL 4: the
server hall's black racks overheating, sparks and thin smoke, technicians recoiling and
shielding their eyes.`,
  },
  {
    name: "pagina29",
    prompt: `${STYLE}

4 panels, subdued epilogue tones. PANEL 1: a distant, formal panel — ${ELENA} testifying at a
commission hearing table, seen small and formal from the back of a room. PANEL 2: ${MARCOS}
watching a muted screen alone at home, expression unreadable. PANEL 3: three weeks later, Elena
sitting alone at the same old bar table as before, an untouched cup of coffee in front of her.
PANEL 4: close on Elena's hand resting a moment too long on Marcos's shoulder as she rises to
leave, neither of them speaking, restrained and wordless.`,
  },
  {
    name: "pagina30",
    prompt: `${STYLE}

4 panels, calm closing tones. PANEL 1: ${MARCOS} walking alone through a present-day Barcelona
street, unhurried, ordinary city life around him. PANEL 2: close on his face, eyes fixed on
some point that isn't on any street. PANEL 3: his lips moving slightly as if humming, faint
musical-note-like lines drifting from his mouth and fading into the air. PANEL 4: a final wide
panel — Marcos small within a busy sunlit street, the city moving on around him, at peace.`,
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
  const outPath = new URL(`../src/assets/images/sintonizadores_comic/${p.name}.jpg`, import.meta.url);
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
