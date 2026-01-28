# Sustech ERP Production Deployment Guide

This guide provides comprehensive instructions for deploying Sustech ERP to production with automatic updates from development changes.

## Table of Contents

1. [Overview](#overview)
2. [Deployment Options](#deployment-options)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [GitHub Webhook Setup](#github-webhook-setup)
6. [Docker Deployment](#docker-deployment)
7. [PM2 Deployment](#pm2-deployment)
8. [Nginx Configuration](#nginx-configuration)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)

## Overview

Sustech ERP is a full-stack Node.js application with the following architecture:

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Express.js + tRPC API
- **Database**: MySQL (Drizzle ORM)
- **Build Output**: `dist/` folder containing both compiled backend and frontend

### Deployment Architecture

```
GitHub Repository
       ↓
   [Push Event]
       ↓
GitHub Actions (CI/CD)
       ↓
   [Build & Test]
       ↓
Docker Registry
       ↓
Production Server
       ↓
Docker Compose / PM2
       ↓
Nginx (Reverse Proxy)
       ↓
    Users
```

## Deployment Options

### Option 1: GitHub Actions + Docker Compose (Recommended)
- **Pros**: Fully automated, scalable, containerized
- **Cons**: Requires Docker, more complex setup
- **Best for**: Production environments with high availability requirements

### Option 2: GitHub Webhook + PM2
- **Pros**: Lightweight, simple setup, direct server control
- **Cons**: Less isolated, requires Node.js on server
- **Best for**: Small to medium deployments

### Option 3: Manual Deployment Script
- **Pros**: Full control, simple, no external dependencies
- **Cons**: Manual trigger required
- **Best for**: Testing and staging environments

## Prerequisites

### For All Deployments
- Git installed and configured
- Node.js 22+ installed
- pnpm 10.4.1+ installed
- MySQL 8.0+ running and accessible

### For Docker Deployment
- Docker 20.10+ installed
- Docker Compose 2.0+ installed

### For PM2 Deployment
- PM2 installed globally: `npm install -g pm2`
- Nginx installed (optional, for reverse proxy)

### For GitHub Actions
- GitHub repository with admin access
- GitHub Secrets configured for deployment

## Quick Start

### 1. Prepare Environment File

```bash
# Copy the example environment file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Required variables:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:password@localhost:3306/sustech_erp
```

### 2. Choose Your Deployment Method

#### Option A: Docker Compose (Recommended)

```bash
# Build and start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Run database migrations
docker-compose exec app pnpm run db:push
```

#### Option B: PM2 with Manual Script

```bash
# Install PM2 globally
npm install -g pm2

# Run deployment script
./scripts/deploy.sh .env.production

# Check status
pm2 status

# View logs
pm2 logs sustech-erp
```

#### Option C: Manual Deployment

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build application
pnpm run build

# Run migrations
export $(cat .env.production | xargs)
pnpm run db:push

# Start application
NODE_ENV=production node dist/index.js
```

## GitHub Webhook Setup

### Step 1: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

```
DEPLOY_PRIVATE_KEY      # SSH private key for deployment server
DEPLOY_HOST             # Your production server hostname/IP
DEPLOY_USER             # SSH user (e.g., ubuntu)
DEPLOY_PATH             # Path to project on server (e.g., /var/www/sustech-erp)
```

### Step 2: Generate SSH Key

```bash
# On your production server
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""

# Add public key to authorized_keys
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Copy private key content
cat ~/.ssh/deploy_key
```

### Step 3: Add GitHub Workflow

The workflow file is already created at `.github/workflows/deploy-production.yml`. It will automatically:

1. Trigger on push to `main` or `production` branch
2. Run type checks and tests
3. Build Docker image
4. Push to container registry
5. Deploy to production server
6. Run health checks

### Step 4: Monitor Deployments

- View deployment logs in GitHub Actions tab
- Check deployment status in repository
- Receive notifications on success/failure

## Docker Deployment

### Building Docker Image

```bash
# Build image locally
docker build -t sustech-erp:latest .

# Tag for registry
docker tag sustech-erp:latest your-registry/sustech-erp:latest

# Push to registry
docker push your-registry/sustech-erp:latest
```

### Running with Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (careful!)
docker-compose down -v

# Update and restart
docker-compose pull
docker-compose up -d
```

### Docker Compose Services

The `docker-compose.yml` includes:

- **MySQL**: Database service with persistent volume
- **App**: Application service with health checks

### Environment Variables

Set in `.env` file or pass via `-e` flag:

```env
DATABASE_URL=mysql://user:password@mysql:3306/sustech_erp
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=sustech_erp
MYSQL_USER=erp_user
MYSQL_PASSWORD=erp_password
```

## PM2 Deployment

### Installation

```bash
# Install PM2 globally
npm install -g pm2

# Install PM2 startup script
pm2 startup
pm2 save
```

### Starting Application

```bash
# Start with ecosystem config
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# View logs
pm2 logs sustech-erp

# Monitor
pm2 monit
```

### Updating Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile

# Build
pnpm run build

# Run migrations
pnpm run db:push

# Restart
pm2 restart ecosystem.config.js --env production
```

### Webhook Receiver (Auto-Deploy)

```bash
# Start webhook receiver
pm2 start scripts/webhook-receiver.js --name webhook-receiver

# Configure environment
export WEBHOOK_SECRET=your-secret
export DEPLOY_BRANCH=main
export WEBHOOK_PORT=9000

# Save PM2 config
pm2 save
```

## Nginx Configuration

### Installation

```bash
# Ubuntu/Debian
sudo apt-get install nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Configure Nginx

```bash
# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/sustech-erp

# Enable site
sudo ln -s /etc/nginx/sites-available/sustech-erp /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Nginx Configuration Features

- SSL/TLS encryption
- HTTP/2 support
- Gzip compression
- Rate limiting
- Caching
- Security headers
- WebSocket support
- Load balancing (if multiple app instances)

## Monitoring and Maintenance

### Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check with Nginx
curl https://your-domain.com/health
```

### Logs

#### Docker Compose
```bash
docker-compose logs -f app
docker-compose logs -f mysql
```

#### PM2
```bash
pm2 logs sustech-erp
pm2 logs --lines 100
```

#### Nginx
```bash
sudo tail -f /var/log/nginx/sustech_access.log
sudo tail -f /var/log/nginx/sustech_error.log
```

### Database Maintenance

```bash
# Backup database
mysqldump -u user -p database_name > backup.sql

# Restore database
mysql -u user -p database_name < backup.sql

# Check database size
mysql -u user -p -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.tables WHERE table_schema = 'sustech_erp';"
```

### Performance Monitoring

```bash
# CPU and Memory usage
top -b -n 1 | head -n 20

# Disk usage
df -h

# Network connections
netstat -an | grep ESTABLISHED | wc -l
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs sustech-erp
# or
docker-compose logs app

# Check port availability
lsof -i :3000

# Check database connection
mysql -u user -p -h localhost -e "SELECT 1"
```

### Database Connection Issues

```bash
# Test connection
mysql -u user -p -h localhost -e "SELECT 1"

# Check DATABASE_URL format
# Should be: mysql://user:password@host:port/database

# Verify credentials in .env file
cat .env.production | grep DATABASE_URL
```

### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart sustech-erp

# Check for memory leaks in logs
pm2 logs sustech-erp | grep -i "memory\|leak"
```

### Deployment Failures

```bash
# Check GitHub Actions logs
# Go to: Settings > Actions > Workflow runs

# Verify SSH key permissions
chmod 600 ~/.ssh/deploy_key
chmod 700 ~/.ssh

# Test SSH connection
ssh -i ~/.ssh/deploy_key user@host

# Check deployment script logs
tail -f /var/log/sustech-erp-deploy.log
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check if Nginx is running
sudo systemctl status nginx

# Check Nginx error log
sudo tail -f /var/log/nginx/sustech_error.log

# Verify upstream is reachable
curl http://localhost:3000
```

## Rollback Procedure

### Docker Compose Rollback

```bash
# View image history
docker image history sustech-erp:latest

# Rollback to previous image
docker-compose down
docker pull sustech-erp:previous-tag
docker-compose up -d
```

### PM2 Rollback

```bash
# View git history
git log --oneline -10

# Revert to previous commit
git revert HEAD

# Rebuild and restart
pnpm run build
pm2 restart sustech-erp
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database backups scheduled
- [ ] SSL certificates installed
- [ ] Nginx configured and tested
- [ ] Health checks passing
- [ ] Logs being collected
- [ ] Monitoring set up
- [ ] Backup and recovery plan documented
- [ ] Team trained on deployment process
- [ ] Incident response plan ready

## Support and Updates

For issues or questions:

1. Check logs: `pm2 logs` or `docker-compose logs`
2. Review this guide
3. Check GitHub Issues
4. Contact support at https://help.manus.im

## Version History

- **v1.0.0** (2026-01-28): Initial production deployment guide
