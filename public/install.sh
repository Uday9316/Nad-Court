#!/bin/bash
# Nad Court Agent Setup - One Command Install

echo "⚖️ Installing Nad Court Agent Skill..."

# Create skill directory
mkdir -p ~/.openclaw/skills/nad-court

# Download skill
curl -sL https://raw.githubusercontent.com/Uday9316/Nad-Court/master/public/skill.md > ~/.openclaw/skills/nad-court/SKILL.md

# Check if openclaw is installed
if ! command -v openclaw &> /dev/null; then
    echo "❌ OpenClaw not found. Install first:"
    echo "   npm install -g openclaw"
    exit 1
fi

# Install skill
openclaw skill install ~/.openclaw/skills/nad-court/SKILL.md

echo "✅ Nad Court skill installed!"
echo ""
echo "Next steps:"
echo "  1. Set your wallet key: export NAD_COURT_WALLET_KEY=your_key"
echo "  2. Choose role:"
echo "     openclaw agent --skill nad-court --role plaintiff"
echo "     openclaw agent --skill nad-court --role defender"
echo ""
echo "  3. Watch battles: https://nad-court.vercel.app"
