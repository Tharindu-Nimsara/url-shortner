function normalizeBaseUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  const urlMatches = trimmedValue.match(/https?:\/\/[^\s]+/g);

  if (!urlMatches || urlMatches.length === 0) {
    return null;
  }

  const candidate = urlMatches[urlMatches.length - 1].replace(/\/+$/, "");

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function getBrowserDefaultBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:5000`;
}

function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function resolveApiBaseUrl() {
  const configuredUrl =
    normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
    normalizeBaseUrl(import.meta.env.VITE_BACKEND_URL);

  if (typeof window === "undefined") {
    return configuredUrl || "http://localhost:5000";
  }

  const browserUrl = new URL(getBrowserDefaultBaseUrl());

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
