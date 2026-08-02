require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
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
