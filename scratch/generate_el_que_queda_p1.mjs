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

A dim bedroom at night, seen from a low, intimate angle. A frail, thin hand rests on a pale
bedsheet, fingers barely grazing the edge of a small tablet propped on a nightstand — the
hand rendered with a soft watercolor blur around the fingertips to suggest an involuntary
tremor, ink lines slightly broken and doubled there, as if the line itself could not hold
steady. The tablet's screen glows with a cold cyan-white light, faint and simple, with no
readable text or icons — plain washes of pale light only.

The person's face is not shown: we see the back of a head resting on the pillow, dark hair
in shadow, one shoulder, and one edge-lit eye barely visible in profile, catching a single
warm amber glint reflected from the screen — the only warm note in the whole image. Beyond
the nightstand, a window shows a flat, starless night sky in deep indigo.

Loose expressive ink linework, soft layered watercolor washes, muted cold palette — slate
blue, charcoal grey, pale indigo — with that one small amber highlight in the eye as the sole
warm accent. Atmospheric, hushed, painterly, book-illustration composition, vertical framing,
completely free of any text or typography.`;

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

const outPath = new URL("../src/assets/images/el_que_queda/pagina1.jpg", import.meta.url);
await writeFile(outPath, Buffer.from(imagePart.inlineData.data, "base64"));
console.log("Guardada en", outPath.pathname);
