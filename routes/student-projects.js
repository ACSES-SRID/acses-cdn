const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { validateId } = require('../middleware/validate');

const router = express.Router();
const DB_NAME = 'acses-website';
const COLLECTION = 'studentProjects';

async function getCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection(COLLECTION);
}

// Public: list approved projects only (supports optional pagination)
router.get('/', async (req, res) => {
    try {
        const col = await getCollection();
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const skip = (page - 1) * limit;

        const filter = { status: 'approved' };
        const [items, total] = await Promise.all([
            col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            col.countDocuments(filter)
        ]);

        res.json({ items, total, page, limit });
    } catch (err) {
        console.error(`GET /${COLLECTION}:`, err.message);
        res.status(500).json({ error: `Failed to fetch ${COLLECTION}` });
    }
});

// Protected: list ALL projects (including pending) for admin review
router.get('/all', requireAuth, async (req, res) => {
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
        console.error(`GET /${COLLECTION}/all:`, err.message);
        res.status(500).json({ error: `Failed to fetch ${COLLECTION}` });
    }
});

// Public: submit a project (defaults to pending for admin approval)
router.post('/', async (req, res) => {
    const { title, description, technologies, image, github, demo, video, submittedBy } = req.body;
    try {
        const col = await getCollection();
        const result = await col.insertOne({
            title,
            description,
            technologies,
            image,
            github,
            demo,
            video,
            submittedBy: submittedBy || 'anonymous',
            status: 'pending',
            createdAt: new Date()
        });
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        console.error(`POST /${COLLECTION}:`, err.message);
        res.status(500).json({ error: `Failed to submit project` });
    }
});

// Protected: update a project by ID (admin can change status to 'approved')
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

// Protected: delete a project by ID
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
