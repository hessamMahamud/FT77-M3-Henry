import { GoogleGenerativeAI } from "@google/generative-ai";

const RETRY_AFTER_FALLBACK_SECONDS = 30;
const MODEL_NAME = "gemini-flash-lite-latest";

export default async function handler(req, res) {
  // Validamos el metodo. Solo aceptamos POST.
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Extraer payload del body. El cliente nos manda shape de Gemini.
    const { contents, systemInstruction, generationConfig } = req.body ?? {};

    // 3. Validacion minima: contents tiene que ser un array no vacio.
    if (!Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: "contents required and must be non-empty" });
    }

    // 4. Inicializar SDK con la API key de variables de entorno.
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction,
      generationConfig,
    });

    // 5. Llamar a Gemini con el historial completo.
    const result = await model.generateContent({ contents });

    // 6. Devolver al cliente la respuesta completa con shape de Gemini.
    return res.status(200).json(result.response);
  } catch (error) {
    // Manejo del 429 (rate limit) preservando el contrato de C6.
    if (error.status === 429) {
      console.warn("Rate limit hit on Gemini");
      return res.status(429).json({
        error: "Rate limit exceeded",
        retryAfterSeconds: RETRY_AFTER_FALLBACK_SECONDS,
      });
    }

    console.error("Error calling Gemini:", error);
    return res.status(500).json({ error: "Error generating response" });
  }
}
