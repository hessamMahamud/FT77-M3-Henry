export async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
    err.status = response.status;

    try {
      err.body = await response.json();
    } catch {
      err.body = null;
    }

    throw err;
  }

  return await response.json();
}
