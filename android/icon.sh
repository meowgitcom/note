#!/usr/bin/env bash

set -e

SVG="../assets/note.svg"
OUT="res"

# Android launcher icon sizes
declare -A SIZES=(
  [mdpi]=48
  [hdpi]=72
  [xhdpi]=96
  [xxhdpi]=144
  [xxxhdpi]=192
)

echo "generating android launcher icons from $SVG ..."

mkdir -p "$OUT"

for DPI in "${!SIZES[@]}"; do
  SIZE=${SIZES[$DPI]}

  # tweak this percentage if icon still feels too zoomed
  PADDED=$((SIZE * 80 / 100))

  DIR="$OUT/mipmap-$DPI"
  mkdir -p "$DIR"

  magick \
    -background none \
    -density 512 \
    "$SVG" \
    -resize "${PADDED}x${PADDED}" \
    -gravity center \
    -extent "${SIZE}x${SIZE}" \
    "$DIR/ic_launcher.png"

  # optional round icon
  cp "$DIR/ic_launcher.png" "$DIR/ic_launcher_round.png"

  echo "✓ $DIR/ic_launcher.png (${SIZE}x${SIZE})"
done

echo
echo "done ✓"
echo
echo "use this in AndroidManifest.xml:"
echo
echo 'android:icon="@mipmap/ic_launcher"'
echo 'android:roundIcon="@mipmap/ic_launcher_round"'