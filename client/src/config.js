const DEFAULT_API_BASE_URL = "http://140.245.4.22:5000";

function resolveApiBaseUrl() {
  // 1. Runtime config injected by Docker entrypoint (highest priority)
  const runtimeUrl = window?.__APP_CONFIG__?.API_BASE_URL;
  if (runtimeUrl && runtimeUrl.startsWith("http")) {
    return runtimeUrl.replace(/\/+$/, "");
  }

  // 2. Build-time env variable
  const envUrl =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl && envUrl.startsWith("http")) {
    return envUrl.replace(/\/+$/, "");
  }

  // 3. Hardcoded fallback
  return DEFAULT_API_BASE_URL;
}

const API_BASE_URL = resolveApiBaseUrl();

export { API_BASE_URL };
