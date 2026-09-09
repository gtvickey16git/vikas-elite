#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=================================================="
echo "    Launching vikas.elite Portfolio Website...    "
echo "=================================================="

# Open index.html directly in default browser
open "$DIR/index.html"

# Also start python server in background on port 8080 if desired
echo "Starting local server at http://localhost:8080 (or http://vikas.elite:8080 if hosts entry added)..."
python3 -m http.server 8080
