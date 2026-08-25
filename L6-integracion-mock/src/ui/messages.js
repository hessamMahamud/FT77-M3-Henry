export function getUserMessage(error) {
  if (error?.code === "NO_RESULTS") {
    return "No encontramos personajes con ese nombre. Probá otro.";
  }

  if (error?.status === 404) {
    return "El personaje que buscas no existe.";
  }

  if (error?.status === 429) {
    return "La AI esta saturada. Intenta de nuevo en un minuto.";
  }

  if (error?.status >= 500) {
    return "La API esta teniendo problemas. Intenta en unos minutos.";
  }

  if (error?.name === "TypeError" && error.message.includes("fetch")) {
    return "No pudimos conectar con la API. Revisa tu conexion.";
  }

  return "Algo salio mal. Intenta de nuevo.";
}
