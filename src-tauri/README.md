# OverLearn - Tauri Desktop App

This directory contains the Tauri Rust backend for the OverLearn native desktop application.

## 🦀 Prerequisites

### Install Rust

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Reload shell configuration
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version
```

### Install System Dependencies (Linux)

**Ubuntu/Debian:**
```bash
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
    libnotify-dev
```

**Fedora:**
```bash
sudo dnf install \
    webkit2gtk4.1-devel \
    openssl-devel \
    curl \
    wget \
    file \
    gtk3-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel \
    libnotify-devel
```

**Arch Linux:**
```bash
sudo pacman -S \
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
```

## 🚀 Development

### Run Development Mode

```bash
# From project root
npm run tauri:dev

# This will:
# 1. Start Next.js dev server (port 3000)
# 2. Launch Tauri window with the app
```

### Build for Production

```bash
# Build the desktop app
npm run tauri:build

# Output will be in: src-tauri/target/release/bundle/
# - .deb package (Debian/Ubuntu)
# - .AppImage (Universal Linux)
```

### Debug Build (faster compilation)

```bash
npm run tauri:build:debug
```

## 📁 Project Structure

```
src-tauri/
├── Cargo.toml              # Rust dependencies
├── tauri.conf.json         # Tauri configuration
├── build.rs                # Build script
├── capabilities/           # Security permissions
│   └── default.json
├── icons/                  # Application icons
└── src/                    # Rust source code
    ├── main.rs             # Entry point
    ├── commands.rs         # Tauri commands (IPC)
    ├── notifications.rs    # Native notifications
    └── tray.rs             # System tray
```

## 🔧 Features

### System Tray
- Minimize to tray
- Quick actions menu
- Left-click to toggle window

### Native Notifications
- Linux: libnotify (D-Bus)
- Pomodoro timer alerts
- Study goal milestones

### Tauri Commands (IPC)
- `greet(name)` - Test command
- `show_notification(title, body)` - Show system notification
- `get_app_version()` - Get app version
- `open_dev_tools()` - Open DevTools (debug mode)

## 🛠️ Troubleshooting

### Error: "webkit2gtk not found"
Install the missing dependency:
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### Error: "cargo not found"
Rust is not installed. Follow the Rust installation steps above.

### Error: "failed to load icon"
The app includes a fallback minimal icon. For production, replace icons in `src-tauri/icons/`.

### Error: "Permission denied" on Linux
Make sure you have proper permissions for D-Bus notifications:
```bash
# Check if notification daemon is running
pgrep -a notification-daemon

# Test with notify-send
notify-send "Test" "If you see this, notifications work!"
```

## 📦 Distribution

### Install .deb Package
```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/overlearn_*_amd64.deb
```

### Run .AppImage
```bash
chmod +x overlearn_*.AppImage
./overlearn_*.AppImage
```

## 🔗 Resources

- [Tauri Documentation](https://tauri.app/)
- [Rust Programming Language](https://www.rust-lang.org/)
- [notify-rust (Linux notifications)](https://github.com/hoodie/notify-rust)
