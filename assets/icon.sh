#!/usr/bin/env bash

set -e

SVG="note.svg"

echo "generating icons from $SVG ..."

# ------------------------
# linux png
# ------------------------

magick \
  -background none \
  -density 512 \
  "$SVG" \
  -resize 512x512 \
  -gravity center \
  -extent 512x512 \
  icon.png

echo "✓ icon.png"

# ------------------------
# windows ico
# ------------------------

magick \
  -background none \
  -density 512 \
  "$SVG" \
  -define icon:auto-resize=16,24,32,48,64,128,256 \
  icon.ico

echo "✓ icon.ico"

# ------------------------
# macos icns
# ------------------------

rm -rf icon.iconset
mkdir -p icon.iconset

for SIZE in 16 32 128 256 512; do
  magick \
    -background none \
    -density 512 \
    "$SVG" \
    -resize "${SIZE}x${SIZE}" \
    -gravity center \
    -extent "${SIZE}x${SIZE}" \
    "icon.iconset/icon_${SIZE}x${SIZE}.png"
done

png2icns icon.icns icon.iconset/*.png

echo "✓ icon.icns"

rm -rf icon.iconset

echo
echo "done."