import { setupLinkInterception } from "./navigation.js";
import { router } from "./router.js";

// 1. Activar intercepcion de clicks en links.
setupLinkInterception();

window.addEventListener("popstate", router);

// 2. Render inicial.
router();
