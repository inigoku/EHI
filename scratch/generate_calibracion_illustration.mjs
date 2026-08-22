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
no signage, no watermark, no signature, no flags, no flag-like striping anywhere in the image —
purely abstract, silent imagery. No human figures, no faces, no silhouettes of people.

Deep navy-black starfield background overlaid with fine amber-gold geometric diagram lines, thin
orbit paths, and faint astronomical annotation marks, like a hand-drawn celestial chart — consistent
with the other event-horizon plates in this series.

CENTER: a single spherical horizon, rendered as a softly glowing translucent globe. Inside it, three
distinct axes of light cross through its exact center at different angles, like three armillary rings
intersecting at one point — one axis in warm violet, one in deep teal, one in warm amber-gold. None of
the three axes is brighter, thicker, or more dominant than the others; they are calmly co-present,
independent, none subordinate to any other, each holding its own steady glow rather than flickering
or competing. Where they cross at the center, the light blends into a small, stable, quiet white core.

Surrounding the central sphere, at a respectful distance, three or four smaller, dimmer horizon-shapes
project thin directional beams of plain white-grey light toward the central sphere, as if trying to
press or align its three colored axes into one single external direction. The beams visibly do not
penetrate the sphere's boundary — they flatten, scatter, or bend away at its translucent surface,
never reaching or altering the calm crossed axes inside. The central sphere remains fully stable,
coherent, symmetrical, and undisturbed by the external pressure.

Painterly digital illustration, cinematic rim lighting, rich amber-gold and deep-black palette with
the three internal axis colors (violet, teal, warm gold) as the only saturated color accents,
intricate but elegant and uncluttered, calm rather than dramatic, square book-plate composition.`;

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

const outPath = new URL("../src/assets/images/ilustracion_calibracion.png", import.meta.url);
await writeFile(outPath, Buffer.from(img.imageBytes, "base64"));
console.log("Guardada en", outPath.pathname);
