const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { validateId } = require('../middleware/validate');

const router = express.Router();
const DB_NAME = 'acses-website';
const COLLECTION = 'leadership';

async function getCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection(COLLECTION);
}

// Public: list all leadership members (sorted by display order)
router.get('/', async (req, res) => {
    try {
        const col = await getCollection();
        const items = await col.find({}).sort({ order: 1, createdAt: -1 }).toArray();
        res.json(items);
    } catch (err) {
        console.error(`GET /${COLLECTION}:`, err.message);
        res.status(500).json({ error: `Failed to fetch ${COLLECTION}` });
    }
});

// Protected: add a leadership member
router.post('/', requireAuth, async (req, res) => {
    const { name, role, image, icon, description, order } = req.body;
    try {
        const col = await getCollection();
        const result = await col.insertOne({
            name,
            role,
            image,
            icon,
            description,
            order: order || 0,
            createdAt: new Date()
        });
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        console.error(`POST /${COLLECTION}:`, err.message);
        res.status(500).json({ error: `Failed to create ${COLLECTION} item` });
    }
});

// Protected: update a leadership member by ID
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

// Protected: delete a leadership member by ID
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

module.exports = router;
