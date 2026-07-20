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

Three distinct singularities float in the composition in a loose triangular arrangement, each
orbiting a shared central point of gravity, connected to one another by thin glowing golden threads
of light:

LEFT: a sealed, smooth bronze-gold capsule or cocoon, cracked with fine fissures from which soft,
melting clock hands and thin golden filaments leak out, representing encapsulation and containment.

CENTER, slightly forward: a rotating faceted crystalline prism made of translucent overlapping
planes catching warm amber light, with multiple superposed human profile silhouettes fractured
within its facets, representing superposition and multiplicity.

RIGHT: a dissolving constellation of fine white and gold threads connecting scattered stars, with a
few minimal symbolic glyphs (a star shape, a bird shape, an eye shape) suspended among the
connecting lines, fading softly into the surrounding void, representing dissolution and expansion.

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

const outPath = new URL("../src/assets/images/ilustracion_singularidades.png", import.meta.url);
await writeFile(outPath, Buffer.from(img.imageBytes, "base64"));
console.log("Guardada en", outPath.pathname);
