const express = require('express');
const path = require('path');
const compression = require('compression');
const app = express();

// Define the port
const PORT = 4000;

// Enable Gzip compression
app.use(compression());

// Set caching headers for static files
app.use('/public', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route for testing
app.get('/', (req, res) => {
    res.send(`
        <h1>Welcome to the Image Server</h1>
        <p>Access your images like this:</p>
        <ul>
            <li><a href="/gallery/logo.jpg" target="_blank">Click here</a></li>
        </ul>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
