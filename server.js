const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
require('dotenv').config();

const app = express();

// ── Security Headers ──────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── Request Logging ───────────────────────────────────
// Logs every request to the terminal: method, url, status, response time
// Format: "POST /api/auth/login 200 45ms"
app.use(morgan('[:date[iso]] :method :url :status :response-time[0]ms - :res[content-length]'));

// ── Global Middleware ──────────────────────────────────
app.use(compression());

app.use(cors({
  origin:"*",
  //  [
  //   process.env.CORS_ORIGIN,
  //   process.env.CORS_ORIGIN_VERCEL,
  // ],
  // credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// ── API Documentation ─────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'ACSES API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// ── API Routes ────────────────────────────────────────
app.use('/api', require('./routes'));

// ── Static Files ──────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Health Check ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api-docs`);
  console.log(`Health check at http://localhost:${PORT}/health`);
});
