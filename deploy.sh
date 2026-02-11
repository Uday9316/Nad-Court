#!/bin/bash
# Complete Nad Court Setup & Deploy Script

echo "=========================================="
echo "  Nad Court - Complete Deploy Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
check_prereq() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 not found${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 found${NC}"
        return 0
    fi
}

echo "Checking prerequisites..."
check_prereq node || echo "Install Node.js from https://nodejs.org"
check_prereq npm || echo "npm comes with Node.js"
check_prereq python3 || echo "Install Python 3"
check_prereq git || echo "Install Git"

echo ""
echo -e "${BLUE}What would you like to deploy?${NC}"
echo "1) Smart Contract to Monad"
echo "2) Frontend to Vercel"
echo "3) Python Agents (local)"
echo "4) Everything"
echo ""
read -p "Enter choice (1-4): " choice

deploy_contract() {
    echo ""
    echo -e "${YELLOW}📜 Deploying Smart Contract...${NC}"
    
    if ! command -v forge &> /dev/null; then
        echo "Installing Foundry..."
        curl -L https://foundry.paradigm.xyz | bash
        source ~/.bashrc
        foundryup
    fi
    
    cd contracts
    
    # Create .env if not exists
    if [ ! -f .env ]; then
        echo "PRIVATE_KEY=your_private_key_here" > .env
        echo "RPC_URL=https://rpc.monad.xyz" >> .env
        echo -e "${YELLOW}⚠️  Please edit contracts/.env with your private key${NC}"
        return
    fi
    
    source .env
    
    echo "Building contract..."
    forge build --via-ir
    
    echo "Deploying to Monad Mainnet..."
    forge create src/AgentCourt.sol:AgentCourt \
        --rpc-url $RPC_URL \
        --private-key $PRIVATE_KEY \
        --chain 143 \
        --via-ir \
        --broadcast
    
    echo -e "${GREEN}✅ Contract deployed!${NC}"
    cd ..
}

deploy_frontend() {
    echo ""
    echo -e "${YELLOW}🎮 Deploying Frontend...${NC}"
    
    cd frontend
    
    echo "Installing dependencies..."
    npm install
    
    echo "Building..."
    npm run build
    
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "Deploying to Vercel..."
    vercel --prod
    
    echo -e "${GREEN}✅ Frontend deployed!${NC}"
    cd ..
}

run_agents() {
    echo ""
    echo -e "${YELLOW}🤖 Running Python Agents...${NC}"
    
    pip install -r requirements.txt
    
    cd agents
    python3 main.py
    cd ..
}

case $choice in
    1) deploy_contract ;;
    2) deploy_frontend ;;
    3) run_agents ;;
    4) 
        deploy_contract
        deploy_frontend
        run_agents
        ;;
    *) echo -e "${RED}Invalid choice${NC}" ;;
esac

echo ""
echo "=========================================="
echo -e "${GREEN}Done!${NC}"
echo "=========================================="