#!/bin/sh
set -eu

# Only inject the env var if it is a clean base URL (http(s)://host or http(s)://host:port).
# An invalid or garbled value is ignored so the frontend falls back to its hardcoded default.
API_BASE_URL_VALUE="${API_BASE_URL:-}"

if printf '%s' "${API_BASE_URL_VALUE}" | grep -qE '^https?://[^/]+(:[0-9]+)?/?$'; then
  escaped_api_base_url=$(printf '%s' "${API_BASE_URL_VALUE}" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\/$//')
else
  escaped_api_base_url=""
fi

cat <<EOF >/usr/share/nginx/html/env-config.js
window.__APP_CONFIG__ = {
  API_BASE_URL: "${escaped_api_base_url}"
};
EOF