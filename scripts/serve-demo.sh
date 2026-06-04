#!/usr/bin/env bash
# SCOPE LOCK (agent operating boundary — applies to every task, file, and scheduled run).
# Only ever read, write, or run commands inside the `trustwall` project folder
# (/Users/erikmcdonald/personal-dev/trustwall). Never read, write, move, or delete
# anything anywhere else on the user's computer, for any reason. Web search / fetch is
# permitted when a task needs it (it's network, not the local machine); the local
# filesystem stays off-limits outside this folder.
#
# serve-demo.sh — Serves the standalone demo "customer site" on port 4100, a SEPARATE
# origin from the Trustwall dev server (:3000). This is what proves the cross-origin
# embed + CORS path works the way a real customer's website would hit it.
#
#   bash scripts/serve-demo.sh   →  http://localhost:4100
set -euo pipefail
cd "$(dirname "$0")/../demo"
echo "Demo customer site → http://localhost:4100  (Trustwall app must be running on :3000)"
exec python3 -m http.server 4100
