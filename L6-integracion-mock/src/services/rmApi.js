import { fetchJson } from "./fetchJson.js";

function buildCharacterSearchUrl({ name, page = 1 }) {
  const baseUrl = "https://rickandmortyapi.com/api/character/";

  const params = new URLSearchParams({
    name: name.trim(),
    page: String(page),
  });

  return `${baseUrl}?${params.toString()}`;
}

export async function getFirstCharacterByName(name) {
  const url = buildCharacterSearchUrl({ name });
  const data = await fetchJson(url);

  const first = data.results?.[0];

  if (!first) {
    const err = new Error("No results");
    err.code = "NO_RESULTS";
    throw err;
  }

  return first;
}
