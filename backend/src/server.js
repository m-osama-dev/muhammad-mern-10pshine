require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

const PLACEHOLDER_SECRETS = ['replace-with-a-long-random-secret', 'secret', 'changeme'];

function validateJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    logger.error('JWT_SECRET is missing from env');
    process.exit(1);
  }

  if (PLACEHOLDER_SECRETS.includes(secret)) {
    logger.error('JWT_SECRET is still set to a placeholder value. Set a real secret before starting the app.');
    process.exit(1);
  }

  if (secret.length < 32) {
    logger.error('JWT_SECRET is too short. Use at least 32 characters.');
    process.exit(1);
  }
}

async function startServer() {
  validateJwtSecret();
  await connectDB();
  
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled Rejection');
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught Exception');
    server.close(() => process.exit(1));
  });
}

startServer();
