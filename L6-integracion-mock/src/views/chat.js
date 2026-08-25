import { getCharacterReply } from "../services/aiClient.js";
import { debounce, wait } from "../services/debounce.js";
import { getUserMessage } from "../ui/messages.js";

const state = {
  messages: [{ role: "character", text: "Hola, soy tu personaje favorito. Que queres saber?" }],
  status: "idle", // 'idle' | 'loading' | 'error'
  error: null,
  lastUserMessage: null,
  retryCountdown: null,
};

export function renderChat() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <div class="chatApp">
      <header class="chatHeader">
        <h1 class="chatHeader__title">Chat</h1>
        <p class="chatHeader__subtitle">Con tu personaje favorito</p>
      </header>

      <main class="chatMessages" id="chatMessages" aria-live="polite">
        ${renderMessages()}
        ${renderStatus()}
      </main>

      <form class="chatComposer" id="chatComposer">
        <input
          class="chatComposer__input"
          id="chatInput"
          type="text"
          placeholder="Escribe un mensaje..."
          aria-label="Escribe tu mensaje"
          ${state.status === "loading" ? "disabled" : ""}
        />
        <button class="chatComposer__send" type="submit" ${state.status === "loading" ? "disabled" : ""}>
          Enviar
        </button>
      </form>
    </div>
  `;

  // Despues de cada render: enganchar listeners y bajar el scroll.
  setupChat();
  scrollToBottom();
}

function renderMessages() {
  return state.messages
    .map(
      (msg) => `
    <div class="message message--${msg.role}">${escapeHtml(msg.text)}</div>
  `,
    )
    .join("");
}

function renderStatus() {
  if (state.status === "loading" && state.retryCountdown != null) {
    return `
      <div class="message message--character message--typing">
        Esperando para reintentar (${state.retryCountdown} segundos)...
      </div>
    `;
  }

  if (state.status === "loading") {
    return `<div class="message message--character message--typing">escribiendo...</div>`;
  }

  if (state.status === "error") {
    return `
      <div class="message message--error">
        ${state.error}
        <button class="message__retry" id="retryBtn" type="button">Reintentar</button>
      </div>
    `;
  }

  return "";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function setState(updates) {
  Object.assign(state, updates);
  renderChat();
}

function setupChat() {
  const $form = document.querySelector("#chatComposer");
  const $input = document.querySelector("#chatInput");
  const $retry = document.querySelector("#retryBtn");

  const debouncedSend = debounce(async () => {
    if (state.status === "loading") return;

    const text = $input.value.trim();
    if (!text) return;

    await sendMessage(text);
    $input.value = "";
  }, 200);

  $form.addEventListener("submit", async (event) => {
    event.preventDefault();
    debouncedSend();
  });

  $retry?.addEventListener("click", () => {
    if (state.lastUserMessage) {
      sendMessage(state.lastUserMessage, true);
    }
  });

  $input.focus();
}

async function sendMessage(text, isRetry = false) {
  const nextMessages = isRetry ? state.messages : [...state.messages, { role: "user", text }];

  setState({
    messages: nextMessages,
    status: "loading",
    error: null,
    lastUserMessage: isRetry ? state.lastUserMessage : text,
  });

  try {
    const reply = await getCharacterReply(nextMessages);
    setState({
      messages: [...nextMessages, { role: "character", text: reply }],
      status: "idle",
      error: null,
      lastUserMessage: null,
    });
  } catch (err) {
    if (err.status === 429) {
      const seconds = err.retryAfterSeconds ?? 5;

      for (let s = seconds; s > 0; s--) {
        setState({ status: "loading", retryCountdown: s });
        await wait(1000);
      }

      try {
        setState({ status: "loading", retryCountdown: null });
        const reply = await getCharacterReply(nextMessages);
        setState({
          messages: [...nextMessages, { role: "character", text: reply }],
          status: "idle",
          error: null,
          lastUserMessage: null,
        });
        return;
      } catch (errRetry) {
        // Reintento fallo, mostrar error final.
        setState({
          status: "error",
          error: getUserMessage(errRetry),
        });
        return;
      }
    }

    setState({
      status: "error",
      error: getUserMessage(err),
    });
  }
}

function scrollToBottom() {
  const $messages = document.querySelector("#chatMessages");
  if ($messages) {
    $messages.scrollTop = $messages.scrollHeight;
  }
}
