const state = {
  messages: [{ role: "character", text: "Hola, soy tu personaje favorito. Que queres saber?" }],
  status: "idle", // 'idle' | 'loading' | 'error'
  error: null,
  lastUserMessage: null,
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

  $form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = $input.value.trim();
    if (!text) return;

    sendMessage(text);
    $input.value = "";
    document.querySelector("#chatInput")?.focus();
  });

  $retry?.addEventListener("click", () => {
    if (state.lastUserMessage) {
      sendMessage(state.lastUserMessage, true);
    }
  });

  $input.focus();
}

async function sendMessage(text, isRetry = false) {
  if (!isRetry) {
    setState({
      messages: [...state.messages, { role: "user", text }],
      status: "loading",
      error: null,
      lastUserMessage: text,
    });
  } else {
    setState({ status: "loading", error: null });
  }

  try {
    const reply = await getCharacterReply(text);
    setState({
      messages: [...state.messages, { role: "character", text: reply }],
      status: "idle",
      error: null,
      lastUserMessage: null,
    });
  } catch {
    setState({
      status: "error",
      error: "Ups, no te pude responder. Reintentalo.",
    });
  }
}

function scrollToBottom() {
  const $messages = document.querySelector("#chatMessages");
  if ($messages) {
    $messages.scrollTop = $messages.scrollHeight;
  }
}

function getCharacterReply(userText) {
  return new Promise((resolve, reject) => {
    const delay = 800 + Math.random() * 1200; // 0.8 a 2 segundos.

    setTimeout(() => {
      if (Math.random() < 0.5) {
        reject(new Error("Network error simulado"));
        return;
      }

      resolve(`Recibido: "${userText}". (Esta respuesta hoy es simulada, en L6 viene de la AI.)`);
    }, delay);
  });
}
