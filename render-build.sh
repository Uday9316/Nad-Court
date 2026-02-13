#!/bin/bash
# Build script for Render - installs OpenClaw

echo "Installing OpenClaw CLI via npm..."

# Install OpenClaw globally via npm
npm install -g openclaw

# Add npm global bin to PATH
export PATH="$(npm root -g)/../bin:$PATH"

# Verify installation
echo "Checking OpenClaw installation..."
which openclaw && openclaw --version

echo "OpenClaw installation complete!"
