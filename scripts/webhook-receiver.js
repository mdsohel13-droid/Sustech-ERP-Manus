#!/usr/bin/env node

/**
 * GitHub Webhook Receiver for Sustech ERP
 * 
 * This script listens for GitHub push events and automatically deploys the application.
 * 
 * Setup:
 * 1. Add this webhook to your GitHub repository:
 *    - Go to Settings > Webhooks > Add webhook
 *    - Payload URL: http://your-server:9000/webhook
 *    - Content type: application/json
 *    - Events: Push events
 *    - Secret: Set a strong secret and use it below
 * 
 * 2. Set environment variables:
 *    - WEBHOOK_SECRET: The secret from GitHub webhook
 *    - DEPLOY_BRANCH: The branch to deploy (default: main)
 * 
 * 3. Run this script:
 *    - node scripts/webhook-receiver.js
 *    - Or use PM2: pm2 start scripts/webhook-receiver.js --name "webhook-receiver"
 */

import crypto from 'crypto';
import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const DEPLOY_BRANCH = process.env.DEPLOY_BRANCH || 'main';
const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 9000;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEPLOYMENT_ENV = process.env.DEPLOYMENT_ENV || '.env.production';

// State management
let isDeploying = false;
const deploymentQueue = [];

// Logging functions
const log = {
  info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`),
  success: (msg) => console.log(`[${new Date().toISOString()}] ✓ ${msg}`),
  error: (msg) => console.error(`[${new Date().toISOString()}] ✗ ${msg}`),
  warning: (msg) => console.warn(`[${new Date().toISOString()}] ⚠ ${msg}`),
};

/**
 * Verify GitHub webhook signature
 */
function verifySignature(payload, signature) {
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${hash}`),
    Buffer.from(signature)
  );
}

/**
 * Execute deployment
 */
async function deploy(ref) {
  if (isDeploying) {
    log.warning('Deployment already in progress, queuing new deployment');
    deploymentQueue.push(ref);
    return;
  }

  isDeploying = true;
  const startTime = Date.now();

  try {
    log.info(`Starting deployment for branch: ${ref}`);

    // Change to project directory
    process.chdir(PROJECT_ROOT);

    // Fetch latest changes
    log.info('Fetching latest changes from repository...');
    await execAsync('git fetch origin');

    // Checkout the branch
    log.info(`Checking out branch: ${ref}`);
    await execAsync(`git checkout ${ref}`);

    // Pull latest changes
    log.info('Pulling latest changes...');
    await execAsync('git pull origin ' + ref);

    // Install dependencies
    log.info('Installing dependencies...');
    await execAsync('pnpm install --frozen-lockfile');

    // Run type check
    log.info('Running type check...');
    try {
      await execAsync('pnpm run check');
    } catch (error) {
      log.warning('Type check failed, continuing with deployment...');
    }

    // Run tests
    log.info('Running tests...');
    try {
      await execAsync('pnpm run test');
    } catch (error) {
      log.warning('Tests failed, continuing with deployment...');
    }

    // Build application
    log.info('Building application...');
    await execAsync('pnpm run build');

    // Run database migrations
    log.info('Running database migrations...');
    const env = `NODE_ENV=production $(cat ${DEPLOYMENT_ENV} | xargs)`;
    try {
      await execAsync(`${env} pnpm run db:push`);
    } catch (error) {
      log.warning('Database migration had issues, but continuing...');
    }

    // Restart application with PM2
    log.info('Restarting application...');
    try {
      await execAsync('pm2 restart ecosystem.config.js --env production');
      await execAsync('pm2 save');
    } catch (error) {
      log.warning('PM2 restart failed, trying Docker Compose...');
      try {
        await execAsync('docker-compose up -d');
      } catch (dockerError) {
        throw new Error('Both PM2 and Docker Compose restart failed');
      }
    }

    // Wait for application to be ready
    log.info('Waiting for application to be ready...');
    let isReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        await execAsync('curl -f http://localhost:3000 > /dev/null 2>&1');
        isReady = true;
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!isReady) {
      throw new Error('Application health check failed');
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log.success(`Deployment completed successfully in ${duration}s`);

  } catch (error) {
    log.error(`Deployment failed: ${error.message}`);
    
    // Attempt rollback
    log.warning('Attempting rollback...');
    try {
      await execAsync('git reset --hard HEAD~1');
      await execAsync('pnpm run build');
      await execAsync('pm2 restart ecosystem.config.js --env production');
      log.success('Rollback completed');
    } catch (rollbackError) {
      log.error(`Rollback failed: ${rollbackError.message}`);
    }

  } finally {
    isDeploying = false;

    // Process queued deployments
    if (deploymentQueue.length > 0) {
      const nextRef = deploymentQueue.shift();
      log.info('Processing queued deployment...');
      deploy(nextRef);
    }
  }
}

/**
 * HTTP server for webhook
 */
const server = http.createServer(async (req, res) => {
  // Only accept POST requests to /webhook
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      // Verify signature
      const signature = req.headers['x-hub-signature-256'];
      if (!signature) {
        log.warning('Webhook request missing signature');
        res.writeHead(401);
        res.end('Unauthorized: Missing signature');
        return;
      }

      if (!verifySignature(body, signature)) {
        log.warning('Webhook request has invalid signature');
        res.writeHead(401);
        res.end('Unauthorized: Invalid signature');
        return;
      }

      // Parse payload
      const payload = JSON.parse(body);

      // Check if it's a push event
      if (payload.ref && payload.repository) {
        const branch = payload.ref.split('/').pop();
        log.info(`Received push event for branch: ${branch}`);

        // Only deploy if it's the configured branch
        if (branch === DEPLOY_BRANCH) {
          res.writeHead(202);
          res.end('Deployment queued');
          
          // Start deployment asynchronously
          deploy(branch).catch(error => {
            log.error(`Unexpected error during deployment: ${error.message}`);
          });
        } else {
          log.info(`Skipping deployment for branch: ${branch} (configured: ${DEPLOY_BRANCH})`);
          res.writeHead(200);
          res.end('OK');
        }
      } else {
        log.warning('Invalid webhook payload');
        res.writeHead(400);
        res.end('Bad Request');
      }

    } catch (error) {
      log.error(`Error processing webhook: ${error.message}`);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
});

// Start server
server.listen(WEBHOOK_PORT, '0.0.0.0', () => {
  log.success(`Webhook receiver listening on port ${WEBHOOK_PORT}`);
  log.info(`Configured to deploy branch: ${DEPLOY_BRANCH}`);
  log.info(`Webhook URL: http://your-server:${WEBHOOK_PORT}/webhook`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    log.success('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    log.success('Server closed');
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled rejection at ${promise}: ${reason}`);
  process.exit(1);
});
