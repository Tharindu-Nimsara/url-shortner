const DEFAULT_API_BASE_URL = "http://140.245.4.22:5000";

function normalizeBaseUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  const urlMatches = trimmedValue.match(/https?:\/\/.*?(?==https?:\/\/|\s|$)/g);

  if (!urlMatches || urlMatches.length === 0) {
    return null;
  }

  const sanitizedMatches = urlMatches
    .map((entry) => entry.replace(/[=,;]+$/, "").trim())
    .filter(Boolean);

  if (sanitizedMatches.length === 0) {
    return null;
  }

  const candidate = sanitizedMatches[sanitizedMatches.length - 1].replace(
    /\/+$/,
    "",
  );

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function getRuntimeConfigBaseUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  return normalizeBaseUrl(window.__APP_CONFIG__?.API_BASE_URL);
}

function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function resolveApiBaseUrl() {
  const configuredUrl =
    getRuntimeConfigBaseUrl() ||
    normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
    normalizeBaseUrl(import.meta.env.VITE_BACKEND_URL);

  if (typeof window === "undefined") {
    return configuredUrl || DEFAULT_API_BASE_URL;
  }

  const browserUrl = new URL(DEFAULT_API_BASE_URL);

  if (!configuredUrl) {
    return browserUrl.toString().replace(/\/$/, "");
  }

  const parsedConfiguredUrl = new URL(configuredUrl);

  if (
    isLocalHostname(parsedConfiguredUrl.hostname) &&
    !isLocalHostname(browserUrl.hostname)
  ) {
    return browserUrl.toString().replace(/\/$/, "");
  }

  return parsedConfiguredUrl.toString().replace(/\/$/, "");
}

const API_BASE_URL = resolveApiBaseUrl();

export { API_BASE_URL };
