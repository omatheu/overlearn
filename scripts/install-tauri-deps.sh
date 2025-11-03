#!/bin/bash

# ============================================
# Tauri Dependencies Installation Script
# Installs everything needed to run OverLearn
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
echo "║   OverLearn - Tauri Setup             ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_error "This script is for Linux only"
    exit 1
fi

# 1. Check/Install Rust
print_info "Verificando Rust..."
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version | awk '{print $2}')
    print_success "Rust já instalado: $RUST_VERSION"
else
    print_warning "Rust não encontrado. Instalando..."

    # Install Rust
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

    # Source cargo env
    source "$HOME/.cargo/env"

    print_success "Rust instalado com sucesso!"
    rustc --version
fi

# 2. Install System Dependencies
print_info "Instalando dependências do sistema..."

# Detect Linux distro
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
else
    DISTRO="unknown"
fi

case $DISTRO in
    ubuntu|debian|pop|linuxmint)
        print_info "Detectado: Ubuntu/Debian"
        sudo apt update
        sudo apt install -y \
            libwebkit2gtk-4.1-dev \
            build-essential \
            curl \
            wget \
            file \
            libssl-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            libnotify-dev \
            patchelf
        print_success "Dependências instaladas!"
        ;;

    fedora)
        print_info "Detectado: Fedora"
        sudo dnf install -y \
            webkit2gtk4.1-devel \
            openssl-devel \
            curl \
            wget \
            file \
            gtk3-devel \
            libappindicator-gtk3-devel \
            librsvg2-devel \
            libnotify-devel
        print_success "Dependências instaladas!"
        ;;

    arch|manjaro)
        print_info "Detectado: Arch Linux"
        sudo pacman -S --needed \
            webkit2gtk-4.1 \
            base-devel \
            curl \
            wget \
            file \
            openssl \
            gtk3 \
            libappindicator-gtk3 \
            librsvg \
            libnotify
        print_success "Dependências instaladas!"
        ;;

    *)
        print_warning "Distribuição não reconhecida: $DISTRO"
        print_info "Por favor, instale manualmente as dependências"
        print_info "Veja: docs/TAURI-SETUP.md"
        ;;
esac

# 3. Verify installations
echo ""
print_info "Verificando instalações..."

if command -v rustc &> /dev/null; then
    print_success "Rust: $(rustc --version)"
else
    print_error "Rust não encontrado"
    exit 1
fi

if command -v cargo &> /dev/null; then
    print_success "Cargo: $(cargo --version)"
else
    print_error "Cargo não encontrado"
    exit 1
fi

if pkg-config --exists webkit2gtk-4.1; then
    print_success "webkit2gtk-4.1: $(pkg-config --modversion webkit2gtk-4.1)"
else
    print_warning "webkit2gtk-4.1 não encontrado (pode causar problemas)"
fi

if pkg-config --exists libnotify; then
    print_success "libnotify: $(pkg-config --modversion libnotify)"
else
    print_warning "libnotify não encontrado (notificações podem não funcionar)"
fi

# 4. Final instructions
echo ""
print_success "✨ Instalação completa!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "   1. Recarregue seu shell (ou abra um novo terminal):"
echo "      ${BLUE}source ~/.bashrc${NC}  # ou ~/.zshrc"
echo ""
echo "   2. Rode a aplicação em modo dev:"
echo "      ${BLUE}npm run tauri:dev${NC}"
echo ""
echo "   3. Ou compile para produção:"
echo "      ${BLUE}npm run tauri:build${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_info "Se você já estava em um terminal, execute:"
echo "   ${BLUE}source \$HOME/.cargo/env${NC}"
echo ""
