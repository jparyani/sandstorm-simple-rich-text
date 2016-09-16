#!/bin/bash
set -euo pipefail
cd /opt/app
npm install
npm run build
exit 0
