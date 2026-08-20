export function renderAbout() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <section class="view view--about">
      <h1>Sobre este proyecto</h1>
      <p>Esta es una POC desarrollada para ComicSansCon.</p>
      <p>El personaje elegido es <strong>[a definir]</strong>.</p>
      <p>Stack: HTML, CSS, JavaScript vanilla, Vercel Functions, Google Gemini.</p>
    </section>
  `;
}
