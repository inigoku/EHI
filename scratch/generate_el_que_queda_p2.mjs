import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "node:fs/promises";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Falta GEMINI_API_KEY en .env");
  process.exit(1);
}

const prompt = `Vertical 3:4 portrait-format ink and watercolor book illustration, painterly, in the
style of a quiet literary graphic-novel plate. Absolutely no text, no letters, no words, no
numbers, no captions, no signage, no watermark, no signature anywhere in the image — purely
visual, silent imagery.

The same dim bedroom as before, now completely empty of any person. Dust motes hang visible
in a thin shaft of light. On the nightstand, a full cup of coffee sits untouched, a faint
line of cold steam no longer rising from it. Behind, a window now shows a soft dawn sky in
muted rose and pale gold — empty, with no one watching it.

The tablet on the nightstand is the only true light source left in the room: on its screen,
rendered only in glowing light with no legible characters, a faint humanoid silhouette made
of thin flickering lines, as if a body were built out of fine threads of glowing code,
partially dissolving into scattered motes of the same light at its edges — fragile, mid
flicker, neither fully present nor fully gone.

Loose expressive ink linework, soft layered watercolor washes, cold dominant palette — slate
blue, charcoal grey, deep indigo — lit by the screen's pale cyan-white glow, with the distant
dawn outside the window as a small, muted, unreachable warm accent. Atmospheric, hushed,
melancholic, painterly, book-illustration composition, vertical framing, completely free of
any text or typography.`;

const ai = new GoogleGenAI({ apiKey });

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-image",
  contents: prompt,
});

const parts = response.candidates?.[0]?.content?.parts || [];
const imagePart = parts.find((p) => p.inlineData?.data);
if (!imagePart) {
  console.error("No se recibió imagen. Respuesta completa:", JSON.stringify(response, null, 2));
  process.exit(1);
}

const outPath = new URL("../src/assets/images/el_que_queda/pagina2.jpg", import.meta.url);
await writeFile(outPath, Buffer.from(imagePart.inlineData.data, "base64"));
console.log("Guardada en", outPath.pathname);
