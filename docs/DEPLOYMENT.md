# Deployment Guide

This guide covers deployment strategies for OverLearn in production environments.

## Table of Contents

- [Docker Deployment](#docker-deployment)
- [Tauri Desktop App](#tauri-desktop-app)
- [systemd Service Management](#systemd-service-management)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Backup and Restore](#backup-and-restore)
- [Monitoring](#monitoring)
- [Security Considerations](#security-considerations)

## Docker Deployment

### Prerequisites

- Docker 24.0+
- Docker Compose 2.0+
- `.env` file with production configuration

### Quick Deploy

```bash
# 1. Clone repository
git clone <repository-url>
cd overlearn

# 2. Create production .env file
cp .env.example .env
nano .env  # Edit with production values

# 3. Build and start
docker compose up -d

# 4. Check status
docker compose ps
docker compose logs -f
```

### Production Build

The multi-stage Dockerfile optimizes for production:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
# Runs as non-root user (nextjs:nodejs)
USER nextjs
CMD ["npm", "start"]
```

**Build optimizations**:
- Multi-stage build reduces final image size
- Non-root user for security
- Only production dependencies included
- Next.js output optimized with Turbopack

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  overlearn:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - overlearn_data:/app/prisma/data  # Persistent database
      - overlearn_uploads:/app/public/uploads  # User uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  overlearn_data:
    driver: local
  overlearn_uploads:
    driver: local
```

### Environment Variables for Production

```env
# Production mode
NODE_ENV=production

# Database (use absolute path for Docker volumes)
DATABASE_URL="file:/app/prisma/data/production.db"

# API Keys (use secrets management in production)
GEMINI_API_KEY="your_production_gemini_key"
GOOGLE_CLIENT_ID="production_client_id"
GOOGLE_CLIENT_SECRET="production_client_secret"

# Email (production SMTP)
EMAIL_HOST="smtp.production.com"
EMAIL_PORT="587"
EMAIL_SECURE="true"
EMAIL_USER="noreply@production.com"
EMAIL_PASSWORD="secure_password"
EMAIL_FROM="OverLearn <noreply@production.com>"

# Security
ALLOWED_ORIGINS="https://overlearn.production.com"
SESSION_SECRET="generate_random_secret_here"
```

### Docker Commands

```bash
# Build
docker compose build

# Start (detached)
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart

# View logs
docker compose logs -f
docker compose logs -f overlearn  # specific service

# Execute commands in container
docker compose exec overlearn npm run prisma:migrate
docker compose exec overlearn npm run prisma:studio

# Backup database
docker compose exec overlearn sqlite3 /app/prisma/data/production.db ".backup /app/prisma/data/backup.db"

# Remove and recreate (⚠️ data loss if no volumes)
docker compose down -v
docker compose up -d
```

### Updating Production

```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# 3. Run migrations (if schema changed)
docker compose exec overlearn npx prisma migrate deploy

# 4. Verify
docker compose ps
docker compose logs -f
```

## Tauri Desktop App

### Building for Linux

```bash
# Install dependencies
bash scripts/install-tauri-deps.sh

# Build production binary
npm run tauri:build
```

**Build outputs** (in `src-tauri/target/release/`):
- `overlearn` - Standalone binary
- `bundle/deb/overlearn_0.1.0_amd64.deb` - Debian package
- `bundle/appimage/overlearn_0.1.0_amd64.AppImage` - AppImage

### Installing the Desktop App

**Method 1: Debian Package (.deb)**

```bash
# Install
sudo dpkg -i src-tauri/target/release/bundle/deb/overlearn_0.1.0_amd64.deb

# Or use apt to handle dependencies
sudo apt install ./src-tauri/target/release/bundle/deb/overlearn_0.1.0_amd64.deb

# Run
overlearn

# Uninstall
sudo apt remove overlearn
```

**Method 2: AppImage**

```bash
# Make executable
chmod +x src-tauri/target/release/bundle/appimage/overlearn_0.1.0_amd64.AppImage

# Run
./overlearn_0.1.0_amd64.AppImage

# Optional: Move to system location
sudo mv overlearn_0.1.0_amd64.AppImage /opt/overlearn/overlearn.AppImage
sudo ln -s /opt/overlearn/overlearn.AppImage /usr/local/bin/overlearn
```

**Method 3: Standalone Binary**

```bash
# Copy binary
sudo cp src-tauri/target/release/overlearn /usr/local/bin/

# Make executable
sudo chmod +x /usr/local/bin/overlearn

# Run
overlearn
```

### Cross-Platform Building

For building on different architectures:

```bash
# Install cross-compilation toolchain
rustup target add x86_64-unknown-linux-gnu
rustup target add aarch64-unknown-linux-gnu

# Build for specific target
npm run tauri:build -- --target x86_64-unknown-linux-gnu
npm run tauri:build -- --target aarch64-unknown-linux-gnu
```

### Auto-start on Boot

The desktop app can auto-start using systemd user services:

```bash
# Create user service file
mkdir -p ~/.config/systemd/user/
cat > ~/.config/systemd/user/overlearn.service << EOF
[Unit]
Description=OverLearn Desktop Application
After=graphical-session.target

[Service]
Type=simple
ExecStart=/usr/local/bin/overlearn
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

# Enable and start
systemctl --user enable overlearn
systemctl --user start overlearn

# Check status
systemctl --user status overlearn
```

## systemd Service Management

### System-wide Service (Docker)

Install OverLearn as a system service that starts Docker containers on boot:

```bash
# Install
sudo bash scripts/setup-systemd.sh install-system

# Manage service
sudo systemctl start overlearn
sudo systemctl stop overlearn
sudo systemctl restart overlearn
sudo systemctl status overlearn

# Enable/disable auto-start
sudo systemctl enable overlearn
sudo systemctl disable overlearn

# View logs
sudo journalctl -u overlearn -f
sudo journalctl -u overlearn --since today
sudo journalctl -u overlearn --since "2024-01-01" --until "2024-01-31"

# Uninstall
sudo bash scripts/setup-systemd.sh uninstall-system
```

### User Service (Desktop App)

Install as user-level service (no root required):

```bash
# Install
bash scripts/setup-systemd.sh install-user

# Manage service
systemctl --user start overlearn
systemctl --user stop overlearn
systemctl --user restart overlearn
systemctl --user status overlearn

# Enable/disable auto-start
systemctl --user enable overlearn
systemctl --user disable overlearn

# View logs
journalctl --user -u overlearn -f

# Uninstall
bash scripts/setup-systemd.sh uninstall-user
```

### Custom Service Configuration

Edit service files in `systemd/` directory before installing:

**systemd/overlearn.service** (System-wide Docker service):
```ini
[Unit]
Description=OverLearn Application (Docker)
After=network-online.target docker.service
Requires=docker.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/overlearn
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

**systemd/overlearn-user.service** (User-level Docker service):
```ini
[Unit]
Description=OverLearn Application (User Docker)
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=%h/overlearn
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=default.target
```

## Environment Variables

### Required Variables

```env
# Core
DATABASE_URL="file:./production.db"
NODE_ENV="production"
PORT="3000"

# AI
GEMINI_API_KEY="your_api_key"
```

### Optional Variables

```env
# Google Calendar
GOOGLE_CLIENT_ID="client_id"
GOOGLE_CLIENT_SECRET="client_secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google/callback"

# Email Notifications
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="user@gmail.com"
EMAIL_PASSWORD="app_password"
EMAIL_FROM="OverLearn <user@gmail.com>"

# Security
ALLOWED_ORIGINS="https://yourdomain.com"
SESSION_SECRET="random_secret_string"
CSRF_SECRET="random_csrf_secret"

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
LOG_LEVEL="info"
```

### Secrets Management

**For production, use proper secrets management**:

**Option 1: Docker Secrets**

```bash
# Create secrets
echo "secret_value" | docker secret create gemini_api_key -

# Update docker-compose.yml
services:
  overlearn:
    secrets:
      - gemini_api_key
    environment:
      - GEMINI_API_KEY_FILE=/run/secrets/gemini_api_key

secrets:
  gemini_api_key:
    external: true
```

**Option 2: Environment File**

```bash
# Create .env.production (never commit!)
cp .env.example .env.production

# Use with Docker Compose
docker compose --env-file .env.production up -d
```

**Option 3: Vault/External Secrets**

Integrate with HashiCorp Vault, AWS Secrets Manager, or similar.

## Database Migrations

### Development to Production

```bash
# 1. Generate migration locally
npx prisma migrate dev --name add_feature

# 2. Commit migration files
git add prisma/migrations/
git commit -m "Add database migration: add_feature"

# 3. Deploy to production
git push origin main

# 4. Apply migration on server
docker compose exec overlearn npx prisma migrate deploy
# or
ssh production "cd /opt/overlearn && npx prisma migrate deploy"
```

### Zero-Downtime Migrations

For large databases:

1. **Additive changes first** - Add new columns/tables without removing old ones
2. **Deploy code** that works with both old and new schema
3. **Run migration** to add new schema elements
4. **Deploy final code** that uses new schema exclusively
5. **Clean up** old columns/tables in next migration

### Rollback Strategy

```bash
# Create backup before migration
docker compose exec overlearn sqlite3 /app/prisma/data/production.db ".backup /app/prisma/data/pre-migration-backup.db"

# If migration fails, restore backup
docker compose down
docker compose exec overlearn mv /app/prisma/data/pre-migration-backup.db /app/prisma/data/production.db
docker compose up -d
```

## Backup and Restore

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
# scripts/backup-db.sh

BACKUP_DIR="/backups/overlearn"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_FILE="/app/prisma/data/production.db"

# Create backup
docker compose exec overlearn sqlite3 "$DB_FILE" ".backup ${BACKUP_DIR}/backup_${TIMESTAMP}.db"

# Keep only last 30 days
find "$BACKUP_DIR" -name "backup_*.db" -mtime +30 -delete

echo "Backup created: backup_${TIMESTAMP}.db"
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /opt/overlearn/scripts/backup-db.sh >> /var/log/overlearn-backup.log 2>&1
```

### Manual Backup

```bash
# Backup database
docker compose exec overlearn sqlite3 /app/prisma/data/production.db ".backup /app/prisma/data/backup.db"

# Copy to host
docker compose cp overlearn:/app/prisma/data/backup.db ./backup_$(date +%Y%m%d).db

# Backup Docker volumes
docker run --rm \
  -v overlearn_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/overlearn_data_backup_$(date +%Y%m%d).tar.gz /data
```

### Restore from Backup

```bash
# Stop application
docker compose down

# Restore database file
docker compose cp ./backup_20240101.db overlearn:/app/prisma/data/production.db

# Or restore volume
docker run --rm \
  -v overlearn_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/overlearn_data_backup_20240101.tar.gz -C /

# Restart
docker compose up -d
```

## Monitoring

### Health Checks

OverLearn includes a health check endpoint at `/api/health`:

```bash
# Check health
curl http://localhost:3000/api/health

# Response
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected",
  "uptime": 3600
}
```

### Docker Health Checks

Configured in `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Check status:

```bash
docker compose ps
# CONTAINER ID   IMAGE     STATUS (healthy)
```

### Log Monitoring

```bash
# Follow logs
docker compose logs -f

# Filter by level (if structured logging enabled)
docker compose logs | grep ERROR
docker compose logs | grep WARN

# systemd logs
journalctl -u overlearn -f --priority=err
```

### Resource Monitoring

```bash
# Docker stats
docker stats overlearn

# System resources (if systemd service)
systemctl status overlearn
```

## Security Considerations

### Production Checklist

- [ ] Use strong, unique `SESSION_SECRET` and `CSRF_SECRET`
- [ ] Enable HTTPS (use reverse proxy like nginx/Caddy)
- [ ] Restrict `ALLOWED_ORIGINS` to your domain
- [ ] Use environment variables/secrets for sensitive data (never commit to git)
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Enable Docker health checks
- [ ] Run container as non-root user (default in Dockerfile)
- [ ] Set up firewall rules (only expose necessary ports)
- [ ] Enable rate limiting on API routes
- [ ] Regular database backups
- [ ] Monitor logs for security issues
- [ ] Use strong SMTP authentication for email
- [ ] Validate and sanitize all user inputs
- [ ] Keep Node.js and system packages updated

### Reverse Proxy (nginx)

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name overlearn.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name overlearn.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/overlearn.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/overlearn.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/TLS with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d overlearn.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Troubleshooting Deployment

### Docker Issues

**Container won't start**:
```bash
# Check logs
docker compose logs

# Rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up -d
```

**Port already in use**:
```bash
# Find process using port
sudo lsof -i :3000

# Change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Database Issues

**Migrations fail**:
```bash
# Reset database (⚠️ data loss)
docker compose down
docker volume rm overlearn_data
docker compose up -d

# Or fix manually
docker compose exec overlearn npx prisma migrate resolve --rolled-back "20241103_migration_name"
```

### systemd Issues

**Service won't start**:
```bash
# Check status
sudo systemctl status overlearn

# View full logs
sudo journalctl -u overlearn --no-pager

# Check syntax
sudo systemd-analyze verify /etc/systemd/system/overlearn.service

# Reload daemon after changes
sudo systemctl daemon-reload
```

### Permission Issues

**Database permission denied**:
```bash
# Fix volume permissions
docker compose down
docker volume inspect overlearn_data  # Check mount point
sudo chown -R 1001:1001 /var/lib/docker/volumes/overlearn_data/_data
docker compose up -d
```

## Performance Optimization

### Production Next.js

Already optimized in build:
- Static generation where possible
- Image optimization
- Code splitting
- Turbopack bundler
- Compression enabled

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_tasks_status ON Task(status);
CREATE INDEX idx_flashcards_next_review ON Flashcard(nextReview);
CREATE INDEX idx_notifications_user_read ON Notification(userProfileId, isRead);

-- Run VACUUM periodically
VACUUM;
ANALYZE;
```

### Caching

Consider adding Redis for caching:
```yaml
services:
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
```

---

For additional help, see:
- [README.md](../README.md) - General setup and development
- [VERSION-MANAGEMENT.md](./VERSION-MANAGEMENT.md) - Version control
- Project issues on GitHub
