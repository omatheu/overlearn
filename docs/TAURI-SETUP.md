# 🦀 Tauri Desktop App - Complete Setup Guide

This guide will walk you through setting up and building the OverLearn native desktop application using Tauri.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Rust Installation](#rust-installation)
3. [System Dependencies](#system-dependencies)
4. [Project Setup](#project-setup)
5. [Development](#development)
6. [Building](#building)
7. [Distribution](#distribution)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js 18+** (already installed for Next.js)
- **Rust toolchain** (will install below)
- **System libraries** (Linux-specific, see below)

---

## Rust Installation

### Install Rust using rustup

```bash
# Download and install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow the prompts:
# 1) Proceed with standard installation (default)
# 2) Press Enter to confirm

# Reload your shell environment
source $HOME/.cargo/env

# Verify installation
rustc --version  # Should show: rustc 1.75.0 (or newer)
cargo --version  # Should show: cargo 1.75.0 (or newer)
```

### Update Rust (if already installed)

```bash
rustup update stable
```

---

## System Dependencies

### Ubuntu / Debian

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
    libnotify-dev \
    patchelf
```

### Fedora

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

### Arch Linux

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

### Verify Installation

```bash
# Check webkit2gtk
pkg-config --modversion webkit2gtk-4.1

# Check libnotify (for notifications)
pkg-config --modversion libnotify
```

---

## Project Setup

### 1. Install JavaScript Dependencies

The Tauri packages are already in `package.json`. If you haven't run npm install yet:

```bash
npm install
```

### 2. Verify Tauri CLI

```bash
npm run tauri -- --version
# Should output: @tauri-apps/cli 2.0.x
```

### 3. Generate Icons (Optional but Recommended)

Create a 1024x1024px PNG icon as `public/icon.png`, then run:

```bash
# Install ImageMagick (if not installed)
sudo apt install imagemagick

# Generate all icon sizes
./scripts/setup-tauri-icons.sh
```

---

## Development

### Start Development Server

This will start both the Next.js dev server and the Tauri window:

```bash
npm run tauri:dev
```

**What happens:**
1. Next.js dev server starts on `http://localhost:3000`
2. Tauri compiles the Rust backend
3. A native window opens with your app
4. Hot reload works for both frontend and backend changes

### Development Features

- **System Tray**: Minimize to tray, click to toggle window
- **Native Notifications**: Linux libnotify integration
- **DevTools**: Right-click → "Inspect Element" (or F12)

### Testing Tauri Commands

Open the browser console in the Tauri window and test:

```javascript
// Check if running in Tauri
console.log('Is Tauri:', '__TAURI__' in window);

// Test greeting command
const { invoke } = window.__TAURI__.core;
invoke('greet', { name: 'Developer' }).then(console.log);

// Test notification
invoke('show_notification', {
  title: 'Test',
  body: 'This is a test notification'
});
```

---

## Building

### Production Build

```bash
# Build optimized desktop app
npm run tauri:build
```

**Build outputs** (in `src-tauri/target/release/bundle/`):

```
deb/
  └── overlearn_0.1.0_amd64.deb       # Debian/Ubuntu package

appimage/
  └── overlearn_0.1.0_amd64.AppImage  # Universal Linux

```

### Debug Build (Faster Compilation)

```bash
# For testing, without optimizations
npm run tauri:build:debug
```

---

## Distribution

### Installing the .deb Package

```bash
# Install
sudo dpkg -i src-tauri/target/release/bundle/deb/overlearn_*.deb

# Launch from applications menu or terminal
overlearn
```

### Running the .AppImage

```bash
# Make executable
chmod +x src-tauri/target/release/bundle/appimage/overlearn_*.AppImage

# Run directly (no installation needed)
./src-tauri/target/release/bundle/appimage/overlearn_*.AppImage
```

### Uninstalling

```bash
# Uninstall .deb package
sudo apt remove overlearn
```

---

## Troubleshooting

### Error: `webkit2gtk-4.1 not found`

**Solution:**
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### Error: `cargo: command not found`

**Solution:** Rust is not installed. Follow [Rust Installation](#rust-installation) steps above.

### Error: `Failed to load icon`

The app includes a fallback minimal icon, but for production builds:

1. Create `public/icon.png` (1024x1024px)
2. Run `./scripts/setup-tauri-icons.sh`
3. Icons will be generated in `src-tauri/icons/`

### Error: `Permission denied` for notifications

**Solution:** Check if notification daemon is running:

```bash
# Check daemon
pgrep -a notification-daemon

# Test notifications
notify-send "Test" "If you see this, notifications work!"
```

### Build is Too Slow

**Solution:** Use debug builds for development:

```bash
npm run tauri:build:debug
```

### Error: `cannot find -lwebkit2gtk-4.1`

**Solution:** webkit2gtk version mismatch. Try:

```bash
# Check available versions
apt-cache search webkit2gtk | grep dev

# Install the available version
sudo apt install libwebkit2gtk-4.0-dev  # or 4.1-dev
```

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│     Tauri Desktop Window            │
│  ┌───────────────────────────────┐  │
│  │   Next.js App (WebView)       │  │
│  │   - React Components          │  │
│  │   - Tailwind CSS              │  │
│  └───────────────────────────────┘  │
│               ↕ IPC                 │
│  ┌───────────────────────────────┐  │
│  │   Rust Backend                │  │
│  │   - System Tray               │  │
│  │   - Native Notifications      │  │
│  │   - File System Access        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
          ↕
┌─────────────────────────────────────┐
│   Linux System APIs                 │
│   - D-Bus (notifications)           │
│   - GTK (window management)         │
│   - libnotify (alerts)              │
└─────────────────────────────────────┘
```

---

## Next Steps

1. ✅ **Complete Tauri setup** (this guide)
2. 🔔 **Implement system notifications integration** (next task)
3. 🎨 **Create notification preferences UI**
4. ⏱️ **Integrate Pomodoro timer with notifications**
5. 📖 **Update main README.md with all instructions**

---

## Resources

- [Tauri Documentation](https://tauri.app/)
- [Tauri 2.0 Migration Guide](https://v2.tauri.app/start/migrate/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [notify-rust (Linux)](https://github.com/hoodie/notify-rust)
- [Tauri Discord](https://discord.com/invite/tauri)

---

## File Structure

```
src-tauri/
├── Cargo.toml                # Rust dependencies
├── tauri.conf.json           # Tauri config (window, bundle, etc.)
├── build.rs                  # Build script
├── capabilities/             # Security permissions (Tauri 2.0)
│   └── default.json
├── icons/                    # Application icons
│   ├── 32x32.png
│   ├── 128x128.png
│   ├── icon.png
│   └── icon.ico
└── src/                      # Rust source code
    ├── main.rs               # Entry point, Tauri setup
    ├── commands.rs           # IPC commands (callable from JS)
    ├── notifications.rs      # Native notification system
    └── tray.rs               # System tray menu
```

---

**🎉 You're all set! Run `npm run tauri:dev` to start developing.**
