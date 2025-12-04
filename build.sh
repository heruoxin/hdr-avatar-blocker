#!/bin/bash

# Remove old dist directory and recreate it
rm -rf dist
mkdir -p dist

# Create zip file
# Exclude release-files, TODO.md, user script, dist directory itself, hidden files, and the original example image
zip -r dist/hdr-avatar-blocker.zip . -x "release-files/*" "*.md" "hdr-avatar-blocker.user.js" "dist/*" ".*" "assets/meiwaku_example.jpg" "build.sh"

echo "Build complete! File saved to dist/hdr-avatar-blocker.zip"
