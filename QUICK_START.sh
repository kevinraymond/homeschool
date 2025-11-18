#!/bin/bash

# Homeschool AI - Quick Start Script
# This script helps you move the project to your new repo and get started

echo "🎓 Homeschool AI - Quick Start"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Create your project directory${NC}"
echo "Where do you want to create the project?"
read -p "Enter path (e.g., ~/projects/homeschool-ai): " PROJECT_PATH

# Expand ~ to home directory
PROJECT_PATH="${PROJECT_PATH/#\~/$HOME}"

echo ""
echo "Creating directory at: $PROJECT_PATH"
mkdir -p "$PROJECT_PATH"

echo ""
echo -e "${BLUE}Step 2: Copy files${NC}"
cp -r /tmp/homeschool-ai/* "$PROJECT_PATH/"
cp /tmp/homeschool-ai/.gitignore "$PROJECT_PATH/"
cp /tmp/homeschool-ai/.env.example "$PROJECT_PATH/"

echo -e "${GREEN}✓ Files copied!${NC}"

echo ""
echo -e "${BLUE}Step 3: Initialize git${NC}"
cd "$PROJECT_PATH"
git init
git add .
git commit -m "Initial project structure from research"

echo -e "${GREEN}✓ Git initialized!${NC}"

echo ""
echo -e "${BLUE}Step 4: Environment setup${NC}"
echo "Do you have a Supabase project set up? (y/n)"
read -p "> " HAS_SUPABASE

if [ "$HAS_SUPABASE" = "n" ]; then
    echo ""
    echo "Please set up Supabase first:"
    echo "1. Go to https://supabase.com"
    echo "2. Create a new project"
    echo "3. Run the schema from packages/database/src/schema.sql"
    echo "4. Get your Project URL and anon key"
    echo ""
    echo "Then run this script again or manually:"
    echo "  cp .env.example .env"
    echo "  nano .env  # Add your Supabase credentials"
else
    echo ""
    echo "Great! Enter your Supabase credentials:"
    read -p "Supabase URL: " SUPABASE_URL
    read -p "Supabase Anon Key: " SUPABASE_KEY

    cp .env.example .env
    sed -i "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" .env
    sed -i "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$SUPABASE_KEY|" .env

    echo -e "${GREEN}✓ Environment configured!${NC}"
fi

echo ""
echo -e "${BLUE}Step 5: Install dependencies${NC}"
echo "This will take a few minutes..."

if ! command -v pnpm &> /dev/null; then
    echo "pnpm not found. Installing..."
    npm install -g pnpm
fi

pnpm install

echo -e "${GREEN}✓ Dependencies installed!${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Your project is at: $PROJECT_PATH"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the mobile app:"
echo "   cd $PROJECT_PATH/apps/mobile"
echo "   pnpm start"
echo ""
echo "2. Open Expo Go on your phone and scan QR code"
echo ""
echo "3. Read the docs:"
echo "   - PROJECT_SUMMARY.md - Overview"
echo "   - docs/GETTING_STARTED.md - Detailed setup"
echo "   - IMPLEMENTATION_ROADMAP.md - 12-week plan"
echo ""
echo -e "${YELLOW}Pro tip: Test with your 4 kids as you build!${NC}"
echo ""
echo "Happy building! 🚀"
