#!/bin/bash
# Build script for Render - installs OpenClaw

echo "Installing OpenClaw CLI..."

# Create bin directory
mkdir -p $HOME/.local/bin

# Download and install OpenClaw
curl -fsSL https://github.com/openclaw/openclaw/releases/latest/download/openclaw-linux-amd64 -o $HOME/.local/bin/openclaw
chmod +x $HOME/.local/bin/openclaw

# Add to PATH
export PATH="$HOME/.local/bin:$PATH"

# Verify installation
which openclaw && openclaw --version

echo "OpenClaw installation complete!"
