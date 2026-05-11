const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const clientPromise = require('../config/db');

const router = express.Router();

const DB_NAME = 'acses-website';

/**
 * POST /api/auth/login
 * Authenticates a user against the users collection and returns a JWT.
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const user = await db.collection('users').findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
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
        console.error('POST /auth/login:', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
