import { fetchJson } from "./api.js";

// 1. Estado centralizado: una sola fuente de verdad.
const state = {
  status: "idle", // 'idle' | 'loading' | 'success' | 'error'
  data: null,
  error: null,
};

// 2. Helper para mutar el estado y re-renderizar en un solo paso.
function setState(updates) {
  Object.assign(state, updates);
  render();
}

function render() {
  const $result = document.querySelector("#result");

  // Limpiar clases de estados anteriores.
  $result.className = "";

  if (state.status === "idle") {
    $result.textContent = "Ingresa un ID y presiona Buscar.";
    return;
  }

  if (state.status === "loading") {
    $result.classList.add("state--loading");
    $result.textContent = "Cargando...";
    return;
  }

  if (state.status === "error") {
    $result.classList.add("state--error");
    $result.textContent = `Error: ${state.error}`;
    return;
  }

  if (state.status === "success") {
    $result.classList.add("state--success");
    $result.innerHTML = `
      <h2>To-do #${state.data.id}</h2>
      <p><strong>Titulo:</strong> ${state.data.title}</p>
      <p><strong>Completado:</strong> ${state.data.completed ? "Si" : "No"}</p>
    `;
    return;
  }
}

// Render inicial (estado idle).
render();

const $form = document.querySelector("#searchForm");
const $input = document.querySelector("#searchInput");

$form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $input.value.trim();
  if (!id) return;

  setState({ status: "loading", data: null, error: null });

  try {
    const data = await fetchJson(`https://jsonplaceholder.typicode.com/todos/${id}`);
    setState({ status: "success", data, error: null });
  } catch (err) {
    setState({ status: "error", data: null, error: err.message });
  }
});
