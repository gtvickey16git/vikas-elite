#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=================================================="
echo "    Opening vikas.elite Portfolio in Safari...    "
echo "=================================================="

# Explicitly open in Safari
open -a Safari "$DIR/index.html"
