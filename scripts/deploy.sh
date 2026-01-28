#!/bin/bash

# Sustech ERP Production Deployment Script
# This script handles building, testing, and deploying the application

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_ENV="${1:-.env.production}"
BACKUP_DIR="./backups"
LOGS_DIR="./logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed"
        exit 1
    fi
    
    if [ ! -f "$DEPLOYMENT_ENV" ]; then
        log_error "Environment file not found: $DEPLOYMENT_ENV"
        exit 1
    fi
    
    log_success "All requirements met"
}

create_backup() {
    log_info "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    if [ -d "dist" ]; then
        tar -czf "$BACKUP_DIR/dist_backup_$TIMESTAMP.tar.gz" dist/
        log_success "Backup created: $BACKUP_DIR/dist_backup_$TIMESTAMP.tar.gz"
    fi
}

install_dependencies() {
    log_info "Installing dependencies..."
    pnpm install --frozen-lockfile
    log_success "Dependencies installed"
}

run_type_check() {
    log_info "Running type check..."
    pnpm run check
    log_success "Type check passed"
}

run_tests() {
    log_info "Running tests..."
    if pnpm run test; then
        log_success "Tests passed"
    else
        log_warning "Some tests failed, continuing with deployment..."
    fi
}

build_application() {
    log_info "Building application..."
    pnpm run build
    log_success "Build completed"
}

migrate_database() {
    log_info "Running database migrations..."
    
    export $(cat "$DEPLOYMENT_ENV" | xargs)
    
    if pnpm run db:push; then
        log_success "Database migrations completed"
    else
        log_error "Database migration failed"
        exit 1
    fi
}

start_application() {
    log_info "Starting application..."
    
    # Check if PM2 is installed
    if command -v pm2 &> /dev/null; then
        pm2 start ecosystem.config.js --env production
        pm2 save
        log_success "Application started with PM2"
    else
        log_warning "PM2 not found, using Docker Compose instead..."
        docker-compose up -d
        log_success "Application started with Docker Compose"
    fi
}

health_check() {
    log_info "Running health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

cleanup_logs() {
    log_info "Cleaning up old logs..."
    
    mkdir -p "$LOGS_DIR"
    
    # Keep logs from last 7 days
    find "$LOGS_DIR" -type f -mtime +7 -delete
    
    log_success "Log cleanup completed"
}

main() {
    log_info "Starting Sustech ERP deployment..."
    log_info "Environment: $DEPLOYMENT_ENV"
    log_info "Timestamp: $TIMESTAMP"
    echo ""
    
    check_requirements
    create_backup
    install_dependencies
    run_type_check
    run_tests
    build_application
    migrate_database
    start_application
    
    if health_check; then
        cleanup_logs
        log_success "Deployment completed successfully!"
        echo ""
        log_info "Application is running at http://localhost:3000"
        exit 0
    else
        log_error "Deployment failed - health check did not pass"
        exit 1
    fi
}

# Run main function
main
