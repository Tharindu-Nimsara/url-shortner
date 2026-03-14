#!/bin/sh
set -eu

escaped_api_base_url=$(printf '%s' "${API_BASE_URL:-}" | sed 's/\\/\\\\/g; s/"/\\"/g')

cat <<EOF >/usr/share/nginx/html/env-config.js
window.__APP_CONFIG__ = {
  API_BASE_URL: "${escaped_api_base_url}"
};
EOF