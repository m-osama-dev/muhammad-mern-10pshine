const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');

const logger = require('./config/logger');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');

const allowedOrigins = new Set(
  [process.env.CLIENT_URL].filter(Boolean)
);

const corsOrigin = (origin, callback) => {
  if (
    process.env.NODE_ENV === 'test' ||
    !origin ||
    allowedOrigins.has(origin)
  ) {
    return callback(null, true);
  }

  return callback(new Error('Not allowed by CORS'));
};

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
  });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
module.exports.corsOrigin = corsOrigin;