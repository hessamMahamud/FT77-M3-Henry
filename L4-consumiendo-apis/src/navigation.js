import { router } from "./router.js";

export function navigateTo(path) {
  history.pushState(null, "", path);

  router();
}

export function setupLinkInterception() {
  document.addEventListener("click", (event) => {
    // 1. Buscar el <a> mas cercano (puede estar dentro de un <span>, etc).
    const link = event.target.closest("a");
    if (!link) return;

    // 2. Obtener el href.
    const href = link.getAttribute("href");
    if (!href) return;

    // 3. Filtros de exclusion: si alguno aplica, NO interceptamos.

    // Click con modificadores (Ctrl, Cmd, Shift, Alt) = abrir en otra pestaña/ventana.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    // Link explicitamente para abrir en nueva pestaña.
    if (link.target === "_blank") return;

    // Link a otro dominio.
    if (link.origin !== window.location.origin) return;

    // Protocolos especiales.
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    // 4. Si llegamos aca, es un link interno: interceptar.
    event.preventDefault();
    navigateTo(href);
  });
}
