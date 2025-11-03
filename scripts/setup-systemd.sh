#!/bin/bash

# ============================================
# OverLearn systemd Setup Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check if running as root
check_root() {
    if [ "$1" = "system" ] && [ "$EUID" -ne 0 ]; then
        print_error "System-level installation requires root privileges"
        echo "Please run with sudo: sudo $0 system"
        exit 1
    fi
}

# Install system-level service (requires Docker)
install_system_service() {
    print_info "Installing OverLearn as system-level service..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if docker-compose is installed
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose v2."
        exit 1
    fi

    # Get current directory
    CURRENT_DIR=$(pwd)

    # Copy application to /opt/overlearn
    print_info "Copying application to /opt/overlearn..."
    mkdir -p /opt/overlearn
    cp -r "$CURRENT_DIR"/* /opt/overlearn/
    cp "$CURRENT_DIR"/.env /opt/overlearn/.env 2>/dev/null || print_warning ".env file not found, please create one"

    # Copy systemd service file
    print_info "Installing systemd service..."
    cp systemd/overlearn.service /etc/systemd/system/

    # Reload systemd
    print_info "Reloading systemd daemon..."
    systemctl daemon-reload

    # Enable service
    print_info "Enabling OverLearn service..."
    systemctl enable overlearn.service

    # Start service
    print_info "Starting OverLearn service..."
    systemctl start overlearn.service

    print_success "OverLearn system service installed successfully!"
    echo ""
    echo "📊 Service Status:"
    systemctl status overlearn.service --no-pager || true
    echo ""
    echo "🔧 Useful commands:"
    echo "  sudo systemctl status overlearn    # Check status"
    echo "  sudo systemctl restart overlearn   # Restart service"
    echo "  sudo systemctl stop overlearn      # Stop service"
    echo "  sudo journalctl -u overlearn -f    # View logs"
}

# Install user-level service (no Docker required)
install_user_service() {
    print_info "Installing OverLearn as user-level service..."

    # Get current directory
    CURRENT_DIR=$(pwd)

    # Create user systemd directory
    mkdir -p ~/.config/systemd/user/

    # Update service file with current directory
    sed "s|%h/overlearn|$CURRENT_DIR|g" systemd/overlearn-user.service > ~/.config/systemd/user/overlearn.service

    # Reload systemd user daemon
    print_info "Reloading systemd user daemon..."
    systemctl --user daemon-reload

    # Enable service
    print_info "Enabling OverLearn service..."
    systemctl --user enable overlearn.service

    # Enable lingering (allows service to run even when user is not logged in)
    print_info "Enabling lingering..."
    loginctl enable-linger "$USER"

    # Start service
    print_info "Starting OverLearn service..."
    systemctl --user start overlearn.service

    print_success "OverLearn user service installed successfully!"
    echo ""
    echo "📊 Service Status:"
    systemctl --user status overlearn.service --no-pager || true
    echo ""
    echo "🔧 Useful commands:"
    echo "  systemctl --user status overlearn    # Check status"
    echo "  systemctl --user restart overlearn   # Restart service"
    echo "  systemctl --user stop overlearn      # Stop service"
    echo "  journalctl --user -u overlearn -f    # View logs"
}

# Uninstall service
uninstall_service() {
    local mode=$1

    if [ "$mode" = "system" ]; then
        check_root system
        print_info "Uninstalling system-level service..."

        systemctl stop overlearn.service || true
        systemctl disable overlearn.service || true
        rm -f /etc/systemd/system/overlearn.service
        systemctl daemon-reload

        print_success "System service uninstalled!"

        read -p "Remove application files from /opt/overlearn? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf /opt/overlearn
            print_success "Application files removed!"
        fi
    else
        print_info "Uninstalling user-level service..."

        systemctl --user stop overlearn.service || true
        systemctl --user disable overlearn.service || true
        rm -f ~/.config/systemd/user/overlearn.service
        systemctl --user daemon-reload

        print_success "User service uninstalled!"
    fi
}

# Main script
main() {
    echo ""
    echo "╔═══════════════════════════════════════╗"
    echo "║   OverLearn systemd Setup Script     ║"
    echo "╚═══════════════════════════════════════╝"
    echo ""

    case "${1:-}" in
        system)
            check_root system
            install_system_service
            ;;
        user)
            install_user_service
            ;;
        uninstall-system)
            check_root system
            uninstall_service system
            ;;
        uninstall-user)
            uninstall_service user
            ;;
        *)
            echo "Usage: $0 {system|user|uninstall-system|uninstall-user}"
            echo ""
            echo "Options:"
            echo "  system             Install as system-level service (requires Docker & sudo)"
            echo "  user               Install as user-level service (no Docker, runs on login)"
            echo "  uninstall-system   Uninstall system-level service (requires sudo)"
            echo "  uninstall-user     Uninstall user-level service"
            echo ""
            echo "Examples:"
            echo "  sudo ./scripts/setup-systemd.sh system"
            echo "  ./scripts/setup-systemd.sh user"
            exit 1
            ;;
    esac
}

main "$@"
