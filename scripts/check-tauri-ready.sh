#!/bin/bash

# ============================================
# Verificar se está pronto para rodar Tauri
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "🔍 Verificando requisitos do Tauri..."
echo ""

ALL_OK=true

# Check Rust
if command -v rustc &> /dev/null; then
    echo -e "${GREEN}✓${NC} Rust instalado: $(rustc --version)"
else
    echo -e "${RED}✗${NC} Rust NÃO instalado"
    echo "   Instale: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    ALL_OK=false
fi

# Check Cargo
if command -v cargo &> /dev/null; then
    echo -e "${GREEN}✓${NC} Cargo instalado: $(cargo --version)"
else
    echo -e "${RED}✗${NC} Cargo NÃO instalado"
    ALL_OK=false
fi

# Check webkit2gtk
if pkg-config --exists webkit2gtk-4.1; then
    echo -e "${GREEN}✓${NC} webkit2gtk-4.1: $(pkg-config --modversion webkit2gtk-4.1)"
elif pkg-config --exists webkit2gtk-4.0; then
    echo -e "${YELLOW}⚠${NC} webkit2gtk-4.0 encontrado (4.1 é recomendado)"
    echo "   Instale: sudo apt install libwebkit2gtk-4.1-dev"
else
    echo -e "${RED}✗${NC} webkit2gtk NÃO instalado"
    echo "   Instale: sudo apt install libwebkit2gtk-4.1-dev"
    ALL_OK=false
fi

# Check libnotify
if pkg-config --exists libnotify; then
    echo -e "${GREEN}✓${NC} libnotify: $(pkg-config --modversion libnotify)"
else
    echo -e "${YELLOW}⚠${NC} libnotify NÃO instalado (notificações podem não funcionar)"
    echo "   Instale: sudo apt install libnotify-dev"
fi

# Check GTK
if pkg-config --exists gtk+-3.0; then
    echo -e "${GREEN}✓${NC} GTK+3: $(pkg-config --modversion gtk+-3.0)"
else
    echo -e "${RED}✗${NC} GTK+3 NÃO instalado"
    echo "   Instale: sudo apt install libgtk-3-dev"
    ALL_OK=false
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js NÃO instalado"
    ALL_OK=false
fi

# Check npm
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm: $(npm --version)"
else
    echo -e "${RED}✗${NC} npm NÃO instalado"
    ALL_OK=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✨ Tudo pronto para rodar o Tauri!${NC}"
    echo ""
    echo "Execute:"
    echo "  npm run tauri:dev"
else
    echo -e "${RED}❌ Alguns requisitos estão faltando${NC}"
    echo ""
    echo "Instale as dependências com:"
    echo "  ./scripts/install-tauri-deps.sh"
fi

echo ""
