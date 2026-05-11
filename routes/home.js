const express = require('express');
const clientPromise = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const DB_NAME = 'acses-website';
const COLLECTION = 'home';

async function getCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection(COLLECTION);
}

// Public: get the single home page document
router.get('/', async (req, res) => {
    try {
        const col = await getCollection();
        const home = await col.findOne({});
        if (!home) {
            return res.json({ presidentMessage: '', hodMessage: '', statistics: {} });
        }
        res.json(home);
    } catch (err) {
        console.error(`GET /${COLLECTION}:`, err.message);
        res.status(500).json({ error: 'Failed to fetch home data' });
    }
});

// Protected: upsert the single home document (atomic, no race condition)
router.put('/', requireAuth, async (req, res) => {
    const { presidentMessage, hodMessage, statistics } = req.body;
    try {
        const col = await getCollection();
        await col.findOneAndReplace(
            {},
            { presidentMessage, hodMessage, statistics, updatedAt: new Date() },
            { upsert: true, returnDocument: 'after' }
        );
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error(`PUT /${COLLECTION}:`, err.message);
        res.status(500).json({ error: 'Failed to update home data' });
    }
});

module.exports = router;
