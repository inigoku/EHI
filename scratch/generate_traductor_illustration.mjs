import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "node:fs/promises";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Falta GEMINI_API_KEY en .env");
  process.exit(1);
}

const prompt = `A dark cosmic digital book-illustration plate, painterly, in the visual style of a
literary essay frontispiece. Absolutely no text, no letters, no words, no numbers, no captions,
no signage, no watermark, no signature anywhere in the image — purely visual, silent imagery.

Deep navy-black starfield background overlaid with fine amber-gold geometric diagram lines, thin
orbit paths, and faint astronomical annotation marks, like a hand-drawn celestial chart.

Two unequal horizon-shapes face each other in the composition, connected by a single narrow
luminous golden channel that runs between them like a bridge or a translated signal.

LEFT, larger and more turbulent: a dense, brilliant event-horizon sphere rendered as concentric
rings of swirling amber-white light, tightly wound and overexposed at its core, radiating intense
inward-focused energy — all of its light gathered into one register, none of it escaping outward
on its own.

RIGHT, smaller and calmer: a second, quieter horizon-sphere rendered in cooler bronze tones,
acting as a lens or funnel — receiving the raw light from the left sphere through the golden
channel and re-emitting it outward in a wider, gentler fan of organized golden rays that reach
toward the edge of the frame, toward an implied outside world of faint distant lights and
architecture-like glints (suggesting contracts, doors, ordinary transactions).

The golden channel between the two spheres occasionally frays into thin loose threads that drift
and dissolve near the right sphere, suggesting the fragility of the connection — what happens when
the smaller sphere's light goes out.

Painterly digital illustration, cinematic rim lighting, rich amber and gold linework against deep
black, intricate but elegant and uncluttered, evocative rather than busy, square book-plate
composition.`;

const ai = new GoogleGenAI({ apiKey });

const response = await ai.models.generateImages({
  model: "imagen-4.0-generate-001",
  prompt,
  config: {
    numberOfImages: 1,
    aspectRatio: "1:1",
    personGeneration: "allow_adult",
  },
});

const img = response.generatedImages?.[0]?.image;
if (!img?.imageBytes) {
  console.error("No se recibió imagen. Respuesta completa:", JSON.stringify(response, null, 2));
  process.exit(1);
}

const outPath = new URL("../src/assets/images/ilustracion_traductor.png", import.meta.url);
await writeFile(outPath, Buffer.from(img.imageBytes, "base64"));
console.log("Guardada en", outPath.pathname);
