import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "node:fs/promises";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Falta GEMINI_API_KEY en .env");
  process.exit(1);
}

const prompt = `Ink and watercolor book illustration, in the style of a hand-drawn literary novel plate.
Absolutely no text, no letters, no words, no numbers, no captions, no signage, no watermark, no
signature anywhere in the image, not on buildings, not in the sky, not as a title, nothing written
at all — purely visual, silent imagery.

A vertical triptych in a single composition, split into three horizontal bands by a thin glowing
golden line that curves gently and connects all three.

TOP BAND: a wooden stilt fishing village on a lagoon at night, a lone figure kneeling on a
wooden dock with one arm submerged to the shoulder in dark water, faint golden ripples spreading
from the submerged arm, warm lantern light from the houses, blank unmarked wooden signposts,
night sky with stars.

MIDDLE BAND: a dim modern room with a vertical isolation tank of dark water, a human silhouette
suspended inside it in fetal position, faint cables and blank monitor screens around the tank,
cold blue-grey tones, a city skyline visible through a window behind it.

BOTTOM BAND: misty stone ruins on a mountain ridge at dusk, a small overheating machine with
wisps of smoke curling upward into the fog, faint red glow bleeding through the mist.

Loose expressive ink linework, soft washes, muted limited palette per band (warm amber top, cool
blue-grey middle, muted red-grey bottom), unified by the single golden line threading through all
three, evocative and atmospheric rather than busy or hyper-detailed, book-illustration composition,
painterly, moody, quiet, completely free of any text or typography.`;

const ai = new GoogleGenAI({ apiKey });

const response = await ai.models.generateImages({
  model: "imagen-4.0-generate-001",
  prompt,
  config: {
    numberOfImages: 1,
    aspectRatio: "3:4",
    personGeneration: "allow_adult",
  },
});

const img = response.generatedImages?.[0]?.image;
if (!img?.imageBytes) {
  console.error("No se recibió imagen. Respuesta completa:", JSON.stringify(response, null, 2));
  process.exit(1);
}

const outPath = new URL("../src/assets/images/cuentos/20_sintonizadores.png", import.meta.url);
await writeFile(outPath, Buffer.from(img.imageBytes, "base64"));
console.log("Guardada en", outPath.pathname);
