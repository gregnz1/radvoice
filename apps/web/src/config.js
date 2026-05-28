const defaultApiBase = "http://localhost:8787";
const storageKey = "radvoice.apiBase";

export function resolveApiBase() {
  const params = new URLSearchParams(window.location.search);
  const queryApi = params.get("api");

  if (queryApi) {
    const normalized = normalizeApiBase(queryApi);
    window.localStorage.setItem(storageKey, normalized);
    return normalized;
  }

  return window.localStorage.getItem(storageKey) || defaultApiBase;
}

export function resetApiBase() {
  window.localStorage.removeItem(storageKey);

  const url = new URL(window.location.href);
  url.searchParams.delete("api");
  window.history.replaceState({}, "", url);

  return defaultApiBase;
}

export function normalizeApiBase(value) {
  return value.trim().replace(/\/+$/, "") || defaultApiBase;
}
