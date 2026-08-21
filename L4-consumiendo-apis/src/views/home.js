import { getFirstCharacterByName } from "../services/rmApi.js";
import { toCharacterProfile } from "../transform/character.js";
import { renderCharacterCard } from "../ui/characterCard.js";
import { getUserMessage } from "../ui/messages.js";

const state = {
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  profile: null, // ViewModel cuando hay exito
  errorMessage: null, // mensaje humano cuando hay error
  currentName: "Rick", // nombre que esta cargado (o que vamos a buscar)
};

export function renderHome() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <section class="view view--home">
      <h1>Chatea con tu personaje favorito</h1>
      <p>Una experiencia conversacional con IA.</p>

      <form class="characterForm" id="characterForm">
        <input
          class="characterForm__input"
          id="characterInput"
          type="text"
          value="${state.currentName}"
          placeholder="Nombre del personaje"
          aria-label="Nombre del personaje"
          ${state.status === "loading" ? "disabled" : ""}
        />
        <button class="characterForm__button" type="submit"
                ${state.status === "loading" ? "disabled" : ""}>
          Cambiar personaje
        </button>
      </form>

      <div id="characterContainer">${renderContainer()}</div>

      <p style="text-align:center; margin-top: 2rem;">
        <a class="btn btn--primary" href="/chat">Empezar a chatear</a>
      </p>
    </section>
  `;

  setupHome();

  if (state.status === "idle") {
    loadCharacter(state.currentName);
  }
}

function renderContainer() {
  if (state.status === "loading") {
    return '<p class="homeStatus homeStatus--loading">Cargando personaje...</p>';
  }

  if (state.status === "error") {
    return `<p class="homeStatus homeStatus--error">${state.errorMessage}</p>`;
  }

  return "";
}

function setState(updates) {
  Object.assign(state, updates);
  renderHome();
}

function setupHome() {
  const $form = document.querySelector("#characterForm");
  const $input = document.querySelector("#characterInput");

  $form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $input.value.trim();

    if (!name) {
      setState({
        status: "error",
        errorMessage: "Escribi un nombre para buscar.",
      });
      return;
    }

    setState({ currentName: name });
    loadCharacter(name);
  });
}

// Orquestador: el corazon de la integracion.
// Combina las 3 capas con manejo de estados visuales.
async function loadCharacter(name) {
  setState({ status: "loading", errorMessage: null });

  try {
    // 1. Services: traer datos crudos.
    const raw = await getFirstCharacterByName(name);

    // 2. Transform: convertir a ViewModel.
    const profile = toCharacterProfile(raw);

    // 3. UI: pintar la tarjeta.
    setState({ status: "success", profile });
    const $container = document.querySelector("#characterContainer");
    renderCharacterCard($container, profile);
  } catch (err) {
    setState({
      status: "error",
      errorMessage: getUserMessage(err),
    });
  }
}
