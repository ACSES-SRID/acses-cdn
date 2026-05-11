const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Global Middleware ──────────────────────────────────
app.use(compression());

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : true,
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// ── API Routes ────────────────────────────────────────
app.use('/api', require('./routes'));

// ── Static Files ──────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Health Check ──────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
