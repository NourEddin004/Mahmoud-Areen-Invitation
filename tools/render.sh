#!/bin/sh
# Rasterise the static lake painting to assets/lake.webp (2x, 800×1520).
# Needs Google Chrome and cwebp (brew install webp).
set -e
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
printf '<!doctype html><body style="margin:0"><img src="%s" style="display:block;width:800px;height:1520px">' "file://$PWD/assets/lake-static.svg" > "$TMP/r.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --allow-file-access-from-files --window-size=800,1520 --screenshot="$TMP/lake.png" "file://$TMP/r.html" >/dev/null 2>&1
cwebp -quiet -q 82 "$TMP/lake.png" -o assets/lake.webp
rm -rf "$TMP"
echo "assets/lake.webp $(du -h assets/lake.webp | cut -f1)"
