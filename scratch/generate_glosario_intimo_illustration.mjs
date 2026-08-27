import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "node:fs/promises";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Falta GEMINI_API_KEY en .env");
  process.exit(1);
}

const prompt = `Página ilustrada, formato retrato, en el lenguaje visual de Paul Klee — sin reproducir
ninguna obra suya concreta, solo su estilo: contornos finos y trémulos en tinta negra, glifos
pictográficos ingenuos, paleta terrosa y apagada (ocre, terracota, azul polvo, verde musgo), fondo
tipo pergamino con manchas de acuarela y textura de papel envejecido, cuadrícula tenue apenas
visible bajo la superficie, melancolía suave y contenida (como en sus obras tardías, no en las más
lúdicas).

Composición: la página de un glosario íntimo, escrito a mano, como el fondo de un documento de
duelo. En el margen izquierdo, una columna de palabras a las que solo se les insinúa la forma de
letra (sin texto legible, solo trazos caligráficos abstractos, como escritura vista de lejos).
Junto a cada entrada, un pequeño glifo simbólico distinto, dispersos con el ritmo desordenado y
flotante típico de Klee:
- un horizonte fino con una figura diminuta sosteniendo la distancia con los brazos
- una máscara o pantalla pequeña, hueca por dentro
- dos hilos finos que se enredan solos
- una espiral que se encoge sobre sí misma
- una onda que golpea una puerta cerrada y no entra
- una sola nota musical, aislada, sin pentagrama
- una ventana pequeña con un reloj de arena a cada lado
- la letra griega φ, casi borrándose
- un alfiler clavado sobre una forma que podría ser un mapa
- una vasija a medio llenar
- líneas de puntos ascendiendo como vapor desde el tejado de una casa diminuta
- esa misma casa, con un hueco visible en la pared, del que escapa un hilo de calor

Cabecera superior, a modo de folio de libro: a la izquierda, en versalitas finas, "EL HORIZONTE
INTERIOR"; a la derecha, alineado, "GLOSARIO ÍNTIMO"; una línea horizontal fina separándola del
resto de la página. Sin ningún otro texto legible en la ilustración — todo lo demás son glifos y
trazos, nunca palabras completas.`;

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

const outPath = new URL("../src/assets/images/poemas/clean_poema_glosario.png", import.meta.url);
await writeFile(outPath, Buffer.from(imagePart.inlineData.data, "base64"));
console.log("Guardada en", outPath.pathname);
