#!/bin/bash

# ============================================
# Version Bump Script
# Updates version across all files
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   OverLearn Version Bump              ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check if version argument provided
if [ -z "$1" ]; then
    print_error "No version provided"
    echo ""
    echo "Usage: $0 <version>"
    echo ""
    echo "Examples:"
    echo "  $0 0.2.0       # Set specific version"
    echo "  $0 patch       # Bump patch (0.1.0 → 0.1.1)"
    echo "  $0 minor       # Bump minor (0.1.0 → 0.2.0)"
    echo "  $0 major       # Bump major (0.1.0 → 1.0.0)"
    echo ""
    exit 1
fi

VERSION_ARG=$1

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "Current version: $CURRENT_VERSION"

# Bump version with npm
if [[ "$VERSION_ARG" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Specific version provided
    NEW_VERSION=$VERSION_ARG
    npm version $NEW_VERSION --no-git-tag-version
else
    # Bump type (patch/minor/major)
    npm version $VERSION_ARG --no-git-tag-version
    NEW_VERSION=$(node -p "require('./package.json').version")
fi

print_success "Updated package.json → $NEW_VERSION"

# Update Cargo.toml
sed -i "s/^version = \".*\"/version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml
print_success "Updated src-tauri/Cargo.toml → $NEW_VERSION"

# Update tauri.conf.json
sed -i "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
print_success "Updated src-tauri/tauri.conf.json → $NEW_VERSION"

echo ""
print_success "Version bumped: $CURRENT_VERSION → $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Commit: git commit -am \"chore: bump version to $NEW_VERSION\""
echo "  3. Tag: git tag v$NEW_VERSION"
echo "  4. Build: npm run tauri:build"
echo ""
