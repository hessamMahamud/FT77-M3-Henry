export function renderHome() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <section class="view view--home">
      <h1>Chatea con tu personaje favorito</h1>
      <p>Una experiencia conversacional con IA.</p>
      <a class="btn btn--primary" href="/chat">Empezar a chatear</a>
    </section>
  `;
}
