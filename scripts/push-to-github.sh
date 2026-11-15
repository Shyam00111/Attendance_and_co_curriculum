#!/bin/bash

# GitHub Push Script
# This script prepares and pushes code to GitHub

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== GitHub Push Script ===${NC}"

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    echo -e "${GREEN}Git repository initialized${NC}"
fi

# Get GitHub repository URL
read -p "Enter GitHub repository URL (e.g., https://github.com/username/repo.git): " GITHUB_URL

# Add remote
git remote remove origin 2>/dev/null || true
git remote add origin "$GITHUB_URL"

# Configure git (if not already done)
read -p "Enter your Git username: " GIT_USER
read -p "Enter your Git email: " GIT_EMAIL

git config user.name "$GIT_USER"
git config user.email "$GIT_EMAIL"

echo -e "${GREEN}Git configured${NC}"

# Check git status
echo ""
echo "Current git status:"
git status

# Stage changes
echo ""
read -p "Do you want to stage all changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    echo -e "${GREEN}Changes staged${NC}"
else
    echo "No changes staged"
    exit 0
fi

# Commit changes
echo ""
read -p "Enter commit message: " COMMIT_MESSAGE
git commit -m "$COMMIT_MESSAGE" || echo "Nothing to commit"

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo -e "${GREEN}=== Push Complete ===${NC}"
echo "Repository: $GITHUB_URL"
echo ""
