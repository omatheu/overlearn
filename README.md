# OverLearn

A productivity and learning management application for developers. OverLearn combines task management, study goal tracking, flashcard-based spaced repetition, Pomodoro timer, and AI-powered learning assistance.

## Features

- **Task Management** - Organize work and study tasks with priorities, deadlines, and status tracking
- **Study Goals** - Set learning objectives with progress tracking and milestone notifications
- **Flashcards** - Spaced repetition system using SM-2 algorithm for effective memorization
- **Pomodoro Timer** - Focus timer with work/break sessions and automatic notifications
- **Note Taking** - Free-form notes with tagging system for knowledge organization
- **Concept Library** - Structured knowledge base with linked resources
- **Google Calendar Integration** - Sync tasks and events with Google Calendar
- **AI Assistant** - Powered by Google Gemini (Flash and Pro models)
- **Native Desktop App** - Lightweight Tauri-based desktop application for Linux
- **System Notifications** - Native OS notifications via D-Bus/libnotify and email notifications
- **Docker Support** - Production-ready containerized deployment with systemd integration

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite with Prisma ORM
- **State Management**: Jotai (atomic state management)
- **UI**: Radix UI + Tailwind CSS v4
- **AI**: Google Generative AI (Gemini Flash 1.5 & Pro 1.5)
- **Desktop**: Tauri 2.0 (Rust-based)
- **Containerization**: Docker + Docker Compose
- **Service Management**: systemd (Linux)
- **Notifications**: node-cron, nodemailer, notify-rust (Linux libnotify)

## Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn** or **pnpm**
- **SQLite** (installed by default on most systems)
- **Rust** 1.70+ (only for desktop app development)

### 1. Clone and Install

```bash
git clone <repository-url>
cd overlearn
npm install
```

### 2. Environment Setup

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# Google AI (Gemini API)
GEMINI_API_KEY="your_gemini_api_key_here"

# Google Calendar Integration (optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google/callback"

# Email Notifications (optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASSWORD="your_email_password_or_app_password"
EMAIL_FROM="OverLearn <your_email@gmail.com>"

# App Configuration
NODE_ENV="development"
PORT="3000"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data (optional)
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running the Native Desktop App

OverLearn can run as a native Linux desktop application using Tauri, providing:
- System tray integration
- Native system notifications (D-Bus/libnotify)
- Better performance and smaller memory footprint
- Auto-start on system boot (via systemd)

### Prerequisites for Desktop App

Install Rust and system dependencies:

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env

# Install Tauri dependencies (Ubuntu/Debian)
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

# Or use the provided script
bash scripts/install-tauri-deps.sh
```

### Running Desktop App

```bash
# Development mode (with hot reload)
export PATH="$HOME/.cargo/bin:$PATH" && npm run tauri:dev

# Production build
npm run tauri:build
```

The desktop app includes:
- System tray with minimize to tray functionality
- Native Linux notifications for Pomodoro timer and study goals
- All web features + native integrations

## Docker Deployment

Run OverLearn as a containerized service with auto-start on system boot.

### Quick Start with Docker

```bash
# Create .env file (see Environment Setup above)
cp .env.example .env

# Build and run with Docker Compose
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### systemd Integration (Auto-start on Boot)

Install as a system service:

```bash
# Install as user service (recommended)
bash scripts/setup-systemd.sh install-user

# Or install as system-wide service
sudo bash scripts/setup-systemd.sh install-system

# Check status
systemctl --user status overlearn  # for user service
sudo systemctl status overlearn     # for system service

# View logs
journalctl --user -u overlearn -f   # for user service
sudo journalctl -u overlearn -f     # for system service

# Uninstall
bash scripts/setup-systemd.sh uninstall-user
# or
sudo bash scripts/setup-systemd.sh uninstall-system
```

## Development

### Project Structure

```
overlearn/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   ├── flashcards/         # Flashcard review
│   │   ├── overview/           # Dashboard
│   │   ├── settings/           # Notification preferences
│   │   ├── tasks/              # Task management
│   │   └── test-notifications/ # Notification testing (Tauri only)
│   ├── components/             # React components
│   │   ├── flashcards/
│   │   ├── notifications/
│   │   ├── productivity/       # Pomodoro timer
│   │   ├── tasks/
│   │   └── ui/                 # Shared UI components
│   ├── lib/
│   │   ├── ai/                 # Gemini AI client
│   │   ├── atoms/              # Jotai state
│   │   ├── db/                 # Prisma client
│   │   ├── hooks/              # React hooks
│   │   ├── notifications/      # Notification services
│   │   └── tauri.ts            # Tauri bindings
│   └── types/                  # TypeScript types
├── src-tauri/                  # Tauri (Rust) backend
│   ├── src/
│   │   ├── main.rs             # Tauri entry point
│   │   ├── commands.rs         # IPC commands
│   │   ├── notifications.rs    # Linux libnotify
│   │   └── tray.rs             # System tray
│   ├── Cargo.toml
│   └── tauri.conf.json
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/
│   └── seed.ts                 # Sample data
├── scripts/
│   ├── install-tauri-deps.sh   # Install Rust & deps
│   ├── setup-systemd.sh        # systemd service installer
│   └── bump-version.sh         # Version sync script
├── systemd/
│   ├── overlearn.service       # System service
│   └── overlearn-user.service  # User service
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── .env.example
```

### Common Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run tauri:dev        # Start Tauri desktop app (dev mode)

# Build
npm run build            # Production build (web)
npm run tauri:build      # Build desktop app (production)
npm start                # Start production server

# Linting
npm run lint             # Run ESLint

# Database
npx prisma migrate dev   # Create and apply migrations
npx prisma db push       # Push schema changes without migration
npx prisma studio        # Open Prisma Studio GUI
npx prisma db seed       # Seed database with test data
npx prisma generate      # Regenerate Prisma Client

# Version Management
bash scripts/bump-version.sh <version>  # Bump version across package.json, Cargo.toml, tauri.conf.json
bash scripts/bump-version.sh major     # 0.1.0 -> 1.0.0
bash scripts/bump-version.sh minor     # 0.1.0 -> 0.2.0
bash scripts/bump-version.sh patch     # 0.1.0 -> 0.1.1
```

### Path Aliases

Use `@/*` for imports from the `src/` directory:

```typescript
import { prisma } from '@/lib/db/prisma';
import { flashModel } from '@/lib/ai/gemini';
import { PomodoroTimer } from '@/components/productivity/pomodoro-timer';
```

## Notification System

OverLearn includes a comprehensive notification system with multiple delivery methods and smart scheduling.

### Notification Types

1. **Pomodoro Timer** - Work/break session completions
2. **Study Goal Milestones** - Progress notifications at 25%, 50%, 75%, 100%
3. **Task Deadlines** - Reminders for upcoming and overdue tasks

### Delivery Methods

- **System Notifications** (Tauri only) - Native Linux notifications via D-Bus/libnotify
- **Email Notifications** - HTML emails via SMTP (nodemailer)
- **In-App Notifications** - Notification center in web interface

### Configuring Notifications

Navigate to **Settings** → **Notifications** to configure:
- Enable/disable specific notification events
- Choose delivery methods (system, email, or both)
- Set quiet hours (e.g., 22:00 - 08:00)
- Configure email address

### Automated Checks

Background jobs run automatically:
- **Study goal milestones**: Every 6 hours
- **Study goal deadlines**: Daily at 9 AM
- **Task deadlines**: Daily at 9 AM

### Testing Notifications

In the desktop app, navigate to **/test-notifications** to test all notification types.

## Google Calendar Integration

OverLearn can sync tasks and study goals with Google Calendar.

### Setup

1. Create a Google Cloud project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URI: `http://localhost:3000/api/google/callback`
5. Copy Client ID and Client Secret to `.env` file
6. Navigate to **Calendar** page and click "Connect Google Calendar"

## Database Management

### Viewing Data

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio
```

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations in production
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Backup

```bash
# SQLite backup (simple file copy)
cp prisma/dev.db prisma/dev.db.backup

# Or use SQLite CLI
sqlite3 prisma/dev.db ".backup prisma/dev.db.backup"
```

## Parallel Development with Git Worktrees

When developing new features while keeping a stable version running, use **git worktrees** for lightweight parallel development:

```bash
# Create a worktree for stable version (e.g., main branch)
git worktree add ../overlearn-stable main

# Install dependencies in the worktree (only needed once)
cd ../overlearn-stable
cp ../overlearn/.env .
npm install

# Run stable version on a different port
npm run dev -- --port 3001
```

**Workflow**:
- `overlearn/` → Active development branch (default port 3000)
- `overlearn-stable/` → Stable version for daily use (port 3001)

**Benefits**:
- Lightweight (~50MB vs ~500MB for full clone)
- Run multiple branches simultaneously on different ports
- No Docker overhead or complex setup

### Database Isolation (Optional)

If the feature branch modifies the database schema:

```bash
# In feature branch worktree
# Edit .env to point to a different database file
DATABASE_URL="file:./dev-feature.db"
npx prisma migrate dev
```

## Troubleshooting

### Rust/Tauri Issues

**Problem**: `rustc: command not found`

```bash
# Add Rust to PATH
export PATH="$HOME/.cargo/bin:$PATH"
# or
source $HOME/.cargo/env
```

**Problem**: Tauri build fails with missing dependencies

```bash
# Reinstall dependencies
bash scripts/install-tauri-deps.sh
```

### Database Issues

**Problem**: `Prisma Client` is out of sync

```bash
# Regenerate Prisma Client
npx prisma generate
```

**Problem**: Migration fails

```bash
# Reset database and reapply migrations
npx prisma migrate reset
npx prisma migrate dev
```

**Problem**: Seed command fails with `spawn tsx ENOENT`

```bash
# Install tsx (should be in devDependencies)
npm install --save-dev tsx

# Then run seed
npx prisma db seed
```

### Docker Issues

**Problem**: Port 3000 already in use

```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"
```

**Problem**: Database changes not persisting

```bash
# Check volume exists
docker volume ls | grep overlearn

# Recreate container
docker compose down
docker compose up -d
```

### Notification Issues

**Problem**: System notifications not working in Tauri

- Ensure running in Tauri app (not web browser)
- Check notification preferences are enabled
- Verify `libnotify` is installed: `sudo apt install libnotify-dev`

**Problem**: Email notifications not sending

- Verify SMTP credentials in `.env`
- Check email preferences are enabled
- For Gmail: Use App Password instead of regular password
- Check logs: `docker compose logs -f` or `journalctl --user -u overlearn -f`

## Version Management

OverLearn uses semantic versioning synced across multiple configuration files:

```bash
# Bump version (updates package.json, Cargo.toml, tauri.conf.json)
bash scripts/bump-version.sh patch  # 0.1.0 -> 0.1.1
bash scripts/bump-version.sh minor  # 0.1.0 -> 0.2.0
bash scripts/bump-version.sh major  # 0.1.0 -> 1.0.0

# Or specify exact version
bash scripts/bump-version.sh 1.5.2
```

Version is displayed in:
- Footer (web app)
- System tray tooltip (desktop app)
- About dialog

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Quality

- Use TypeScript strict mode
- Follow ESLint rules: `npm run lint`
- Use Prettier for formatting
- Write meaningful commit messages
- Update documentation when adding features

## License

[Add your license here]

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing documentation in `docs/`
- Review `CLAUDE.md` for development guidelines

---

**Built with ❤️ for developers who never stop learning**
