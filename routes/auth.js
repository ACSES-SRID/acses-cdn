const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const clientPromise = require('../config/db');

const router = express.Router();

const DB_NAME = 'acses-website';

// Rate limit login attempts: max 10 per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /api/auth/login
 * Authenticates a user against the users collection and returns a JWT.
 */
router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const user = await db.collection('users').findOne({ username });

        if (!user || !user.password || typeof user.password !== 'string') {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('POST /auth/login: missing JWT_SECRET');
            return res.status(500).json({ error: 'Login failed' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Never send the password back
        const { password: _, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (err) {
        console.error('POST /auth/login:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
