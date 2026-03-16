const DEFAULT_API_BASE_URL = "http://140.245.4.22:5000";

// Only accept clean base URLs — must be http/https with no path, query, or hash.
// This rejects garbled values like "http://localhost:5000/=http://140.245.4.22:5000".
function isValidBaseUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      (parsed.pathname === "/" || parsed.pathname === "") &&
      parsed.search === "" &&
      parsed.hash === ""
    );
  } catch {
    return false;
  }
}

function resolveApiBaseUrl() {
  // 1. Runtime config injected by Docker entrypoint (highest priority)
  const runtimeUrl = window?.__APP_CONFIG__?.API_BASE_URL;
  if (isValidBaseUrl(runtimeUrl)) {
    return runtimeUrl.replace(/\/+$/, "");
  }

  // 2. Build-time env variable
  const envUrl =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (isValidBaseUrl(envUrl)) {
    return envUrl.replace(/\/+$/, "");
  }

  // 3. Hardcoded fallback
  return DEFAULT_API_BASE_URL;
}

const API_BASE_URL = resolveApiBaseUrl();

export { API_BASE_URL };
