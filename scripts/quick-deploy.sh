#!/bin/bash

###############################################################################
# Quick Deploy Script for OverLearn
# Automates common deployment tasks
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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
Usage: $0 [COMMAND]

Quick deployment commands for OverLearn.

COMMANDS:
    dev             Start development environment
    build           Build for production
    deploy          Deploy to production (Docker + systemd)
    update          Update running production instance
    backup          Backup database
    restore [FILE]  Restore database from backup
    status          Check deployment status
    logs            View application logs
    help            Show this help message

EXAMPLES:
    # Start development
    $0 dev

    # Deploy to production
    $0 deploy

    # Update running instance
    $0 update

    # Backup database
    $0 backup

    # View logs
    $0 logs

EOF
}

cmd_dev() {
    print_header "Starting Development Environment"

    cd "$PROJECT_ROOT"

    # Check if .env exists
    if [ ! -f .env ]; then
        print_warning ".env not found, creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file"
            print_warning "Please update .env with your configuration"
        fi
    fi

    # Install dependencies if needed
    if [ ! -d node_modules ]; then
        print_info "Installing dependencies..."
        npm install
    fi

    # Generate Prisma client
    print_info "Generating Prisma Client..."
    npx prisma generate

    # Run migrations
    print_info "Running database migrations..."
    npx prisma migrate dev

    # Seed database if empty
    print_info "Checking if database needs seeding..."

    # Try to check if database has data (requires sqlite3 CLI)
    if command -v sqlite3 &> /dev/null && [ -f prisma/dev.db ]; then
        PROFILE_COUNT=$(sqlite3 prisma/dev.db "SELECT COUNT(*) FROM UserProfile;" 2>/dev/null || echo "0")

        if [ "$PROFILE_COUNT" -eq "0" ]; then
            print_info "Database is empty, seeding with sample data..."
            npx prisma db seed || print_warning "Seeding failed - you can seed manually with: npx prisma db seed"
        else
            print_success "Database already has data (found $PROFILE_COUNT user profile)"
        fi
    else
        # sqlite3 not installed or database doesn't exist yet, try to seed
        print_info "Attempting to seed database (will skip if already seeded)..."
        npx prisma db seed 2>&1 | grep -v "Error.*Unique constraint failed" || true
    fi

    # Start dev server
    print_success "Starting development server..."
    npm run dev
}

cmd_build() {
    print_header "Building for Production"

    cd "$PROJECT_ROOT"

    # Run full build script
    bash "$SCRIPT_DIR/build-all.sh" --all

    print_success "Build completed"
}

cmd_deploy() {
    print_header "Deploying to Production"

    cd "$PROJECT_ROOT"

    # Check if .env exists
    if [ ! -f .env ]; then
        print_error ".env file not found"
        print_info "Create .env with production configuration"
        exit 1
    fi

    # Backup existing database if it exists
    if [ -f prisma/production.db ]; then
        print_info "Backing up existing database..."
        BACKUP_FILE="prisma/production_backup_$(date +%Y%m%d_%H%M%S).db"
        cp prisma/production.db "$BACKUP_FILE"
        print_success "Database backed up to $BACKUP_FILE"
    fi

    # Build Docker image
    print_info "Building Docker image..."
    docker compose build

    # Run migrations
    print_info "Running database migrations..."
    docker compose run --rm overlearn npx prisma migrate deploy

    # Start services
    print_info "Starting services..."
    docker compose up -d

    # Wait for health check
    print_info "Waiting for application to be healthy..."
    sleep 10

    # Check if running
    if docker compose ps | grep -q "Up"; then
        print_success "Application deployed successfully"
        print_info "Access at: http://localhost:3000"
    else
        print_error "Deployment failed. Check logs with: $0 logs"
        exit 1
    fi

    # Optional: Install systemd service
    read -p "Install systemd service for auto-start? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo bash "$SCRIPT_DIR/setup-systemd.sh" install-system
        print_success "systemd service installed"
    fi

    print_success "Deployment complete!"
}

cmd_update() {
    print_header "Updating Production Instance"

    cd "$PROJECT_ROOT"

    # Pull latest changes
    print_info "Pulling latest changes..."
    git pull origin main

    # Backup database
    print_info "Creating backup..."
    BACKUP_FILE="prisma/production_backup_$(date +%Y%m%d_%H%M%S).db"
    docker compose exec overlearn sqlite3 /app/prisma/data/production.db ".backup /app/prisma/data/backup.db" || true
    docker compose cp overlearn:/app/prisma/data/backup.db "$BACKUP_FILE" || true

    # Rebuild and restart
    print_info "Rebuilding Docker image..."
    docker compose build --no-cache

    print_info "Running migrations..."
    docker compose run --rm overlearn npx prisma migrate deploy

    print_info "Restarting services..."
    docker compose down
    docker compose up -d

    # Wait for health check
    sleep 10

    if docker compose ps | grep -q "Up"; then
        print_success "Update completed successfully"
        docker compose logs --tail=50
    else
        print_error "Update failed. Restoring from backup..."
        # Restore backup
        docker compose down
        docker compose cp "$BACKUP_FILE" overlearn:/app/prisma/data/production.db
        docker compose up -d
        print_error "Restored from backup. Check logs for errors."
        exit 1
    fi
}

cmd_backup() {
    print_header "Backing Up Database"

    cd "$PROJECT_ROOT"

    BACKUP_DIR="$PROJECT_ROOT/backups"
    mkdir -p "$BACKUP_DIR"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/overlearn_backup_$TIMESTAMP.db"

    # Check if running in Docker
    if docker compose ps | grep -q "Up"; then
        print_info "Backing up from Docker container..."
        docker compose exec overlearn sqlite3 /app/prisma/data/production.db ".backup /tmp/backup.db"
        docker compose cp overlearn:/tmp/backup.db "$BACKUP_FILE"
    else
        # Backup local database
        if [ -f prisma/dev.db ]; then
            print_info "Backing up local database..."
            cp prisma/dev.db "$BACKUP_FILE"
        else
            print_error "No database found to backup"
            exit 1
        fi
    fi

    # Compress backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"

    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    print_success "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

    # Keep only last 30 days of backups
    find "$BACKUP_DIR" -name "overlearn_backup_*.db.gz" -mtime +30 -delete

    echo ""
    print_info "Backup location: $BACKUP_FILE"
}

cmd_restore() {
    BACKUP_FILE="$1"

    if [ -z "$BACKUP_FILE" ]; then
        print_error "Backup file not specified"
        print_info "Usage: $0 restore <backup-file>"
        exit 1
    fi

    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi

    print_header "Restoring Database"

    # Warning
    print_warning "This will overwrite the current database!"
    read -p "Are you sure? (yes/no) " -r
    echo
    if [[ ! $REPLY =~ ^yes$ ]]; then
        print_info "Restore cancelled"
        exit 0
    fi

    # Decompress if needed
    TEMP_FILE="$BACKUP_FILE"
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        print_info "Decompressing backup..."
        TEMP_FILE="${BACKUP_FILE%.gz}"
        gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    fi

    # Stop services
    print_info "Stopping services..."
    docker compose down || true

    # Restore database
    if docker compose ps &> /dev/null; then
        print_info "Restoring to Docker container..."
        docker compose cp "$TEMP_FILE" overlearn:/app/prisma/data/production.db
    else
        print_info "Restoring local database..."
        cp "$TEMP_FILE" prisma/dev.db
    fi

    # Cleanup temp file
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        rm "$TEMP_FILE"
    fi

    # Restart services
    print_info "Restarting services..."
    docker compose up -d || true

    print_success "Database restored successfully"
}

cmd_status() {
    print_header "Deployment Status"

    cd "$PROJECT_ROOT"

    echo ""
    print_info "Docker Services:"
    docker compose ps || print_warning "Docker Compose not running"

    echo ""
    print_info "systemd Service (System):"
    sudo systemctl status overlearn --no-pager || print_warning "systemd service not installed"

    echo ""
    print_info "systemd Service (User):"
    systemctl --user status overlearn --no-pager || print_warning "User systemd service not installed"

    echo ""
    print_info "Disk Usage:"
    if docker compose ps | grep -q "Up"; then
        docker compose exec overlearn df -h /app/prisma/data 2>/dev/null || true
    fi

    echo ""
    print_info "Docker Volumes:"
    docker volume ls | grep overlearn || print_warning "No Docker volumes found"

    echo ""
    print_info "Application Health:"
    if command -v curl &> /dev/null; then
        curl -s http://localhost:3000/api/health || print_warning "Health check failed"
    else
        print_warning "curl not installed, cannot check health endpoint"
    fi

    echo ""
}

cmd_logs() {
    print_header "Application Logs"

    cd "$PROJECT_ROOT"

    # Check what's running
    if docker compose ps | grep -q "Up"; then
        print_info "Showing Docker logs (Ctrl+C to exit)..."
        docker compose logs -f
    elif systemctl is-active --quiet overlearn; then
        print_info "Showing systemd logs (Ctrl+C to exit)..."
        sudo journalctl -u overlearn -f
    elif systemctl --user is-active --quiet overlearn; then
        print_info "Showing user systemd logs (Ctrl+C to exit)..."
        journalctl --user -u overlearn -f
    else
        print_warning "No running instances found"
        print_info "Available logs:"
        ls -lh "$PROJECT_ROOT"/*.log 2>/dev/null || echo "  No log files found"
    fi
}

# Main
COMMAND="${1:-help}"

case "$COMMAND" in
    dev)
        cmd_dev
        ;;
    build)
        cmd_build
        ;;
    deploy)
        cmd_deploy
        ;;
    update)
        cmd_update
        ;;
    backup)
        cmd_backup
        ;;
    restore)
        cmd_restore "$2"
        ;;
    status)
        cmd_status
        ;;
    logs)
        cmd_logs
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac
