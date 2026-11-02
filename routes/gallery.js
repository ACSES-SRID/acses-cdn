const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { validateId } = require('../middleware/validate');

const router = express.Router();
const DB_NAME = 'acses-website';
const COLLECTION = 'gallery';
const ALBUMS_COLLECTION = 'gallery-albums';

async function getCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection(COLLECTION);
}

async function getAlbumsCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection(ALBUMS_COLLECTION);
}

// ═══════════════════════════════════════════════════════
// Gallery Items (Individual Photos)
// ═══════════════════════════════════════════════════════

// Public: list gallery items (supports optional pagination via ?page=1&limit=20)
router.get('/', async (req, res) => {
    try {
        const col = await getCollection();
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            col.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            col.countDocuments()
        ]);

        res.json({ items, total, page, limit });
    } catch (err) {
        console.error(`GET /${COLLECTION}:`, err.message);
        res.status(500).json({ error: `Failed to fetch ${COLLECTION}` });
    }
});

// Protected: add a gallery item
router.post('/', requireAuth, async (req, res) => {
    const { src, alt, description, category } = req.body;
    try {
        const col = await getCollection();
        const result = await col.insertOne({
            src,
            alt,
            description,
            category,
            createdAt: new Date()
        });
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        console.error(`POST /${COLLECTION}:`, err.message);
        res.status(500).json({ error: `Failed to create ${COLLECTION} item` });
    }
});

// Protected: update a gallery item by ID
router.put('/:id', requireAuth, validateId, async (req, res) => {
    try {
        const col = await getCollection();
        const { _id, ...updateData } = req.body;
        updateData.updatedAt = new Date();
        await col.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData }
        );
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error(`PUT /${COLLECTION}/${req.params.id}:`, err.message);
        res.status(500).json({ error: `Failed to update ${COLLECTION} item` });
    }
});

// Protected: delete a gallery item by ID
router.delete('/:id', requireAuth, validateId, async (req, res) => {
    try {
        const col = await getCollection();
        await col.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(`DELETE /${COLLECTION}/${req.params.id}:`, err.message);
        res.status(500).json({ error: `Failed to delete ${COLLECTION} item` });
    }
});

// ═══════════════════════════════════════════════════════
// Gallery Albums (External Photo Collections)
// ═══════════════════════════════════════════════════════

// Public: list all albums
router.get('/albums', async (req, res) => {
    try {
        const col = await getAlbumsCollection();
        const albums = await col.find({}).sort({ createdAt: -1 }).toArray();
        res.json(albums);
    } catch (err) {
        console.error(`GET /${ALBUMS_COLLECTION}:`, err.message);
        res.status(500).json({ error: 'Failed to fetch albums' });
    }
});

// Protected: create an album
router.post('/albums', requireAuth, async (req, res) => {
    const { title, url, description } = req.body;
    
    if (!title || !url) {
        return res.status(400).json({ error: 'Title and URL are required' });
    }

    try {
        const col = await getAlbumsCollection();
        const doc = {
            title,
            url,
            description: description || '',
            createdAt: new Date()
        };
        const result = await col.insertOne(doc);
        res.status(201).json({ _id: result.insertedId, ...doc });
    } catch (err) {
        console.error(`POST /${ALBUMS_COLLECTION}:`, err.message);
        res.status(500).json({ error: 'Failed to create album' });
    }
});

// Protected: update an album by ID
router.put('/albums/:id', requireAuth, validateId, async (req, res) => {
    const { title, url, description } = req.body;
    
    try {
        const col = await getAlbumsCollection();
        await col.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { title, url, description, updatedAt: new Date() } }
        );
        res.json({ message: 'Album updated successfully' });
    } catch (err) {
        console.error(`PUT /${ALBUMS_COLLECTION}/${req.params.id}:`, err.message);
        res.status(500).json({ error: 'Failed to update album' });
    }
});

// Protected: delete an album by ID
router.delete('/albums/:id', requireAuth, validateId, async (req, res) => {
    try {
        const col = await getAlbumsCollection();
        await col.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Album deleted successfully' });
    } catch (err) {
        console.error(`DELETE /${ALBUMS_COLLECTION}/${req.params.id}:`, err.message);
        res.status(500).json({ error: 'Failed to delete album' });
    }
});

module.exports = router;
