#!/bin/bash

# ============================================
# Tauri Icon Setup Helper
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

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   Tauri Icon Setup Helper             ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check if icon source exists
if [ ! -f "public/icon.png" ]; then
    print_warning "No icon.png found in public/ directory"
    print_info "Please create a 1024x1024px PNG icon as public/icon.png"
    echo ""
    echo "You can use any of these tools:"
    echo "  - GIMP: https://www.gimp.org/"
    echo "  - Inkscape: https://inkscape.org/"
    echo "  - Online: https://www.canva.com/"
    echo ""
    echo "Icon guidelines:"
    echo "  • Size: 1024x1024px (minimum 512x512px)"
    echo "  • Format: PNG with transparency"
    echo "  • Design: Simple, recognizable at small sizes"
    echo "  • Colors: Avoid too many details for better scaling"
    echo ""
    exit 1
fi

print_success "Found icon source: public/icon.png"

# Check if ImageMagick is installed (for icon generation)
if ! command -v convert &> /dev/null; then
    print_warning "ImageMagick not found - required for icon generation"
    echo ""
    echo "Install ImageMagick:"
    echo "  Ubuntu/Debian: sudo apt install imagemagick"
    echo "  Fedora: sudo dnf install ImageMagick"
    echo "  Arch: sudo pacman -S imagemagick"
    echo ""
    exit 1
fi

print_success "ImageMagick is installed"

# Create icons directory
mkdir -p src-tauri/icons

print_info "Generating icons..."

# Generate PNG icons
convert public/icon.png -resize 32x32 src-tauri/icons/32x32.png
convert public/icon.png -resize 128x128 src-tauri/icons/128x128.png
convert public/icon.png -resize 256x256 src-tauri/icons/128x128@2x.png
convert public/icon.png -resize 512x512 src-tauri/icons/icon.png

print_success "Generated PNG icons"

# Generate .ico (Windows)
if command -v icotool &> /dev/null; then
    icotool -c -o src-tauri/icons/icon.ico src-tauri/icons/*.png
    print_success "Generated icon.ico"
else
    print_warning "icotool not found - skipping .ico generation"
    echo "Install: sudo apt install icoutils"
fi

# Generate .icns (macOS)
if command -v png2icns &> /dev/null; then
    png2icns src-tauri/icons/icon.icns src-tauri/icons/icon.png
    print_success "Generated icon.icns"
else
    print_warning "png2icns not found - skipping .icns generation"
    echo "Install: cargo install png2icns"
fi

echo ""
print_success "Icon generation complete!"
echo ""
echo "Generated icons in src-tauri/icons/:"
ls -lh src-tauri/icons/
echo ""
