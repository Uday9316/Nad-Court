#!/bin/bash
# Install OpenClaw on Render

set -e

echo "Installing OpenClaw..."

# Create installation directory
mkdir -p $HOME/.local/bin

# Download OpenClaw binary (adjust URL as needed)
# This is a placeholder - you'll need the actual download URL
curl -fsSL https://github.com/openclaw/openclaw/releases/latest/download/openclaw-linux-amd64 -o $HOME/.local/bin/openclaw

# Make executable
chmod +x $HOME/.local/bin/openclaw

# Add to PATH
export PATH="$HOME/.local/bin:$PATH"

# Verify installation
if command -v openclaw &> /dev/null; then
    echo "✅ OpenClaw installed successfully!"
    openclaw --version
else
    echo "❌ OpenClaw installation failed"
    exit 1
fi
