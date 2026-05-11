const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Shared middleware used by both the JSON API and static asset responses.
app.use(compression());
const corsOptions = {
  // In production, CORS_ORIGIN should be a comma-separated allow-list of frontend URLs.
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json()); // For parsing JSON bodies

// All Mongo-backed content management endpoints are mounted under /api.
app.use('/api', require('./api/routes'));

// Public files are served from /public paths, for example /gallery/logo.jpg.
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
