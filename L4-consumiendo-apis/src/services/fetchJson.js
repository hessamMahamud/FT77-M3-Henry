export async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
    err.status = response.status;
    throw err;
  }

  return await response.json();
}
