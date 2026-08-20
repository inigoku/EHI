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
This is an evocative, symbolic illustration inspired by the idea of a real 1962 portrait — it must
NOT resemble or reproduce that actual painting or depict any specific recognizable person's face.
Keep the figure abstracted, faceless or turned away, more silhouette and presence than portrait.

Deep charcoal-grey background, softer and warmer than the surrounding cosmic starfield plates in
this series — a domestic dusk rather than deep space, faint suggestion of a study or a writing desk
just out of focus in the lower foreground (a blur of paper, an inkwell-like glint), grounding the
image in an interior room rather than the cosmos.

CENTER: a single warm, contained horizon-figure rendered as a seated or three-quarter silhouette
in rich crimson-red light, calm and steady rather than turbulent — a quiet, self-possessed glow,
not a burst of energy. Unlike the swirling overexposed horizons elsewhere in this series, this one
holds its light close, composed, like an ember rather than a flare.

Behind and slightly above the red figure, very faint and translucent, the ghost-outline of a second,
smaller presence made of thin golden desk-lamp light — suggesting a person working, half-visible,
watched over rather than watching.

A thin border of muted grey-blue frames the warm red at the composition's edge, echoing the idea of
a red figure set against a grey field, without literally painting a red dress or any period clothing
detail — this should read as an abstract emotional geometry, not a costume portrait.

Painterly digital illustration, soft rim lighting, warm crimson and muted grey-blue palette (a
quieter, more intimate counterpart to the amber-black cosmic plates elsewhere in the book), intimate
and tender rather than vast, square book-plate composition.`;

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

const outPath = new URL("../src/assets/images/ilustracion_mujer_rojo.png", import.meta.url);
await writeFile(outPath, Buffer.from(img.imageBytes, "base64"));
console.log("Guardada en", outPath.pathname);
