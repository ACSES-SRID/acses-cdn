const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { validateId } = require('../middleware/validate');

const router = express.Router();
const DB_NAME = 'acses-website';
const COLLECTION = 'store';

async function getCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection(COLLECTION);
}

// Public: list products (supports optional pagination via ?page=1&limit=20)
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

// Protected: add a product (prices normalized to numbers)
router.post('/', requireAuth, async (req, res) => {
    const { name, description, price, originalPrice, category, badge, badgeColor, image } = req.body;
    try {
        const col = await getCollection();
        const result = await col.insertOne({
            name,
            description,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            category,
            badge,
            badgeColor,
            image,
            createdAt: new Date()
        });
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        console.error(`POST /${COLLECTION}:`, err.message);
        res.status(500).json({ error: `Failed to create ${COLLECTION} item` });
    }
});

// Protected: update a product by ID
router.put('/:id', requireAuth, validateId, async (req, res) => {
    try {
        const col = await getCollection();
        const { _id, ...updateData } = req.body;
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
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

// Protected: delete a product by ID
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
