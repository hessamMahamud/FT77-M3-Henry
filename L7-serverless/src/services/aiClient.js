import { RICK_SYSTEM_PROMPT } from "./prompts.js";
import { buildPayload, normalizeAIResponse, getTrimmedHistory } from "../transform/chatPayload.js";
import { fetchJson } from "./fetchJson.js";

const CHAT_ENDPOINT = "/api/chat";

export async function getCharacterReply(uiMessages) {
  // 1. Recortar historial para controlar tokens.
  const trimmed = getTrimmedHistory(uiMessages);

  // 2. Construir payload con shape de Gemini.
  const payload = buildPayload({
    systemPrompt: RICK_SYSTEM_PROMPT,
    uiMessages: trimmed,
  });

  // 3. Llamar al mock (en L7: fetch a /api/chat).
  let rawResponse;
  try {
    rawResponse = await fetchJson(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.status === 429 && err.body?.retryAfterSeconds) {
      err.retryAfterSeconds = err.body.retryAfterSeconds;
    }
    throw err;
  }

  // 4. Normalizar la respuesta a string limpio.
  const text = normalizeAIResponse(rawResponse);

  // 5. Logueamos los tokens en consola para que vean el efecto del historial.
  // En produccion esto se saca o se loguea solo en debug.
  const usage = rawResponse?.usageMetadata;
  if (usage) {
    console.log(`[Tokens] input: ${usage.promptTokenCount}, output: ${usage.candidatesTokenCount}`);
  }

  return text;
}
