#!/bin/bash

###############################################################################
# Build Script for OverLearn
# Builds both Docker images and Tauri desktop app
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
BUILD_DOCKER=true
BUILD_TAURI=true
BUILD_WEB=false
PUSH_DOCKER=false
DOCKER_REGISTRY=""
VERSION=$(node -p "require('$PROJECT_ROOT/package.json').version")

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Build OverLearn for production deployment.

OPTIONS:
    -h, --help              Show this help message
    -d, --docker-only       Build only Docker image
    -t, --tauri-only        Build only Tauri desktop app
    -w, --web-only          Build only web (Next.js)
    -a, --all               Build all targets (default)
    -p, --push              Push Docker image to registry
    -r, --registry REGISTRY Docker registry URL (e.g., docker.io/username)
    -v, --version VERSION   Override version (default: from package.json)
    --no-cache              Build Docker without cache

EXAMPLES:
    # Build everything
    $0

    # Build only Docker image
    $0 --docker-only

    # Build and push Docker image
    $0 --docker-only --push --registry docker.io/username

    # Build Tauri with custom version
    $0 --tauri-only --version 1.0.0

EOF
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"
}

check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"
}

check_rust() {
    if ! command -v rustc &> /dev/null; then
        print_error "Rust is not installed"
        print_info "Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        exit 1
    fi
    print_success "Rust found: $(rustc --version)"
}

check_dependencies() {
    print_header "Checking dependencies"

    if [ "$BUILD_DOCKER" = true ]; then
        check_docker
    fi

    if [ "$BUILD_TAURI" = true ] || [ "$BUILD_WEB" = true ]; then
        check_node
    fi

    if [ "$BUILD_TAURI" = true ]; then
        check_rust
    fi

    echo ""
}

build_web() {
    print_header "Building Web (Next.js)"

    cd "$PROJECT_ROOT"

    print_info "Installing dependencies..."
    npm ci --omit=dev

    print_info "Generating Prisma Client..."
    npx prisma generate

    print_info "Building Next.js application..."
    npm run build

    print_success "Web build completed"
    print_info "Build output: $PROJECT_ROOT/.next"
    echo ""
}

build_docker() {
    print_header "Building Docker Image"

    cd "$PROJECT_ROOT"

    # Check if .env file exists
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        print_info "Creating .env from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_warning "Please update .env with production values"
        else
            print_error ".env.example not found"
            exit 1
        fi
    fi

    # Build arguments
    BUILD_ARGS=""
    if [ "$NO_CACHE" = true ]; then
        BUILD_ARGS="--no-cache"
    fi

    # Image tags
    IMAGE_NAME="overlearn"
    if [ -n "$DOCKER_REGISTRY" ]; then
        IMAGE_NAME="$DOCKER_REGISTRY/overlearn"
    fi

    print_info "Building image: $IMAGE_NAME:$VERSION"
    print_info "Also tagging as: $IMAGE_NAME:latest"

    docker build $BUILD_ARGS \
        -t "$IMAGE_NAME:$VERSION" \
        -t "$IMAGE_NAME:latest" \
        .

    print_success "Docker image built successfully"
    print_info "Image: $IMAGE_NAME:$VERSION"
    print_info "Image: $IMAGE_NAME:latest"

    # Show image size
    SIZE=$(docker images "$IMAGE_NAME:latest" --format "{{.Size}}")
    print_info "Image size: $SIZE"

    # Push if requested
    if [ "$PUSH_DOCKER" = true ]; then
        print_header "Pushing Docker Image"

        if [ -z "$DOCKER_REGISTRY" ]; then
            print_error "Registry not specified. Use -r or --registry option"
            exit 1
        fi

        print_info "Pushing $IMAGE_NAME:$VERSION..."
        docker push "$IMAGE_NAME:$VERSION"

        print_info "Pushing $IMAGE_NAME:latest..."
        docker push "$IMAGE_NAME:latest"

        print_success "Images pushed successfully"
    fi

    echo ""
}

build_tauri() {
    print_header "Building Tauri Desktop App"

    cd "$PROJECT_ROOT"

    # Check Tauri dependencies
    print_info "Checking Tauri dependencies..."
    if ! dpkg -l | grep -q libwebkit2gtk-4.1-dev; then
        print_warning "Tauri dependencies not fully installed"
        print_info "Run: bash scripts/install-tauri-deps.sh"
        read -p "Install dependencies now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            bash "$SCRIPT_DIR/install-tauri-deps.sh"
        else
            print_error "Cannot build Tauri without dependencies"
            exit 1
        fi
    fi

    # Add Rust to PATH
    if [ -f "$HOME/.cargo/env" ]; then
        source "$HOME/.cargo/env"
    fi
    export PATH="$HOME/.cargo/bin:$PATH"

    print_info "Installing npm dependencies..."
    npm ci

    print_info "Building Tauri application..."
    npm run tauri:build

    print_success "Tauri build completed"

    # List build artifacts
    print_header "Build Artifacts"

    RELEASE_DIR="$PROJECT_ROOT/src-tauri/target/release"

    if [ -f "$RELEASE_DIR/overlearn" ]; then
        BINARY_SIZE=$(du -h "$RELEASE_DIR/overlearn" | cut -f1)
        print_info "Binary: $RELEASE_DIR/overlearn ($BINARY_SIZE)"
    fi

    if [ -d "$RELEASE_DIR/bundle/deb" ]; then
        DEB_FILE=$(find "$RELEASE_DIR/bundle/deb" -name "*.deb" | head -n 1)
        if [ -f "$DEB_FILE" ]; then
            DEB_SIZE=$(du -h "$DEB_FILE" | cut -f1)
            print_info "Debian package: $DEB_FILE ($DEB_SIZE)"
        fi
    fi

    if [ -d "$RELEASE_DIR/bundle/appimage" ]; then
        APPIMAGE_FILE=$(find "$RELEASE_DIR/bundle/appimage" -name "*.AppImage" | head -n 1)
        if [ -f "$APPIMAGE_FILE" ]; then
            APPIMAGE_SIZE=$(du -h "$APPIMAGE_FILE" | cut -f1)
            print_info "AppImage: $APPIMAGE_FILE ($APPIMAGE_SIZE)"
        fi
    fi

    echo ""
}

create_release_archive() {
    print_header "Creating Release Archive"

    RELEASE_DIR="$PROJECT_ROOT/release-$VERSION"
    mkdir -p "$RELEASE_DIR"

    # Copy Tauri artifacts
    if [ "$BUILD_TAURI" = true ]; then
        TAURI_RELEASE="$PROJECT_ROOT/src-tauri/target/release"

        if [ -f "$TAURI_RELEASE/overlearn" ]; then
            cp "$TAURI_RELEASE/overlearn" "$RELEASE_DIR/"
        fi

        if [ -d "$TAURI_RELEASE/bundle/deb" ]; then
            cp "$TAURI_RELEASE/bundle/deb"/*.deb "$RELEASE_DIR/" 2>/dev/null || true
        fi

        if [ -d "$TAURI_RELEASE/bundle/appimage" ]; then
            cp "$TAURI_RELEASE/bundle/appimage"/*.AppImage "$RELEASE_DIR/" 2>/dev/null || true
        fi
    fi

    # Create archive
    ARCHIVE_NAME="overlearn-$VERSION-$(uname -m).tar.gz"
    tar -czf "$PROJECT_ROOT/$ARCHIVE_NAME" -C "$RELEASE_DIR" .

    ARCHIVE_SIZE=$(du -h "$PROJECT_ROOT/$ARCHIVE_NAME" | cut -f1)
    print_success "Release archive created: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

    # Cleanup
    rm -rf "$RELEASE_DIR"

    echo ""
}

print_summary() {
    print_header "Build Summary"

    echo -e "Version: ${GREEN}$VERSION${NC}"
    echo ""

    if [ "$BUILD_WEB" = true ]; then
        echo -e "${GREEN}✓${NC} Web build completed"
    fi

    if [ "$BUILD_DOCKER" = true ]; then
        echo -e "${GREEN}✓${NC} Docker image built"
        if [ "$PUSH_DOCKER" = true ]; then
            echo -e "${GREEN}✓${NC} Docker image pushed to registry"
        fi
    fi

    if [ "$BUILD_TAURI" = true ]; then
        echo -e "${GREEN}✓${NC} Tauri desktop app built"
    fi

    echo ""
    print_info "Next steps:"

    if [ "$BUILD_DOCKER" = true ] && [ "$PUSH_DOCKER" = false ]; then
        echo "  • Test Docker image: docker compose up -d"
        echo "  • Push to registry: docker push <registry>/overlearn:$VERSION"
    fi

    if [ "$BUILD_TAURI" = true ]; then
        echo "  • Test Tauri app: ./src-tauri/target/release/overlearn"
        echo "  • Install .deb: sudo dpkg -i src-tauri/target/release/bundle/deb/*.deb"
    fi

    if [ "$BUILD_DOCKER" = true ]; then
        echo "  • Deploy with systemd: sudo bash scripts/setup-systemd.sh install-system"
    fi

    echo ""
}

# Parse arguments
NO_CACHE=false
BUILD_ALL=true

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -d|--docker-only)
            BUILD_DOCKER=true
            BUILD_TAURI=false
            BUILD_WEB=false
            BUILD_ALL=false
            shift
            ;;
        -t|--tauri-only)
            BUILD_DOCKER=false
            BUILD_TAURI=true
            BUILD_WEB=false
            BUILD_ALL=false
            shift
            ;;
        -w|--web-only)
            BUILD_DOCKER=false
            BUILD_TAURI=false
            BUILD_WEB=true
            BUILD_ALL=false
            shift
            ;;
        -a|--all)
            BUILD_DOCKER=true
            BUILD_TAURI=true
            BUILD_WEB=true
            BUILD_ALL=true
            shift
            ;;
        -p|--push)
            PUSH_DOCKER=true
            shift
            ;;
        -r|--registry)
            DOCKER_REGISTRY="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    clear
    print_header "OverLearn Build Script v$VERSION"
    echo ""

    # Check dependencies
    check_dependencies

    # Build targets
    if [ "$BUILD_WEB" = true ]; then
        build_web
    fi

    if [ "$BUILD_DOCKER" = true ]; then
        build_docker
    fi

    if [ "$BUILD_TAURI" = true ]; then
        build_tauri
        create_release_archive
    fi

    # Summary
    print_summary
}

# Run main
main
