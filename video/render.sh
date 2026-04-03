#!/bin/bash
# Render all Center This Div promo videos
# Usage: cd video && bash render.sh
# Outputs: out/tiktok.mp4, out/shorts.mp4, out/reel.mp4

set -e

echo "=== Center This Div - Video Render ==="
echo ""

mkdir -p out

echo "[1/3] Rendering TikTok (15s, 1080x1920)..."
npx remotion render src/index.ts TikTok out/tiktok.mp4 --codec h264

echo "[2/3] Rendering YouTube Shorts (30s, 1080x1920)..."
npx remotion render src/index.ts Shorts out/shorts.mp4 --codec h264

echo "[3/3] Rendering Instagram Reel (20s, 1080x1920)..."
npx remotion render src/index.ts Reel out/reel.mp4 --codec h264

echo ""
echo "=== Done ==="
echo "  TikTok:   out/tiktok.mp4  (15s)"
echo "  Shorts:   out/shorts.mp4  (30s)"
echo "  Reel:     out/reel.mp4    (20s)"
