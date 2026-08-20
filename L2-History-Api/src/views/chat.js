export function renderChat() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <div class="chatApp">
      <header class="chatHeader">
        <h1 class="chatHeader__title">Chat</h1>
        <p class="chatHeader__subtitle">Con tu personaje favorito</p>
      </header>

      <main class="chatMessages" aria-label="Mensajes">
        <div class="message message--character">Hola, ¿en qué te puedo ayudar hoy?</div>
        <div class="message message--user">Quiero practicar diseño responsive.</div>
        <div class="message message--character">Perfecto. Empecemos por mobile-first.</div>
      </main>

      <form class="chatComposer">
        <input
          class="chatComposer__input"
          type="text"
          placeholder="Escribe un mensaje…"
          aria-label="Escribe tu mensaje"
        />
        <button class="chatComposer__send" type="submit">Enviar</button>
      </form>
    </div>
  `;
}
