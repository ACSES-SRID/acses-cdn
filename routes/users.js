const express = require('express');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const clientPromise = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { validateId } = require('../middleware/validate');

const router = express.Router();
const DB_NAME = 'acses-website';
const COLLECTION = 'users';

async function getCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection(COLLECTION);
}

// Protected: list all users (passwords are NEVER returned)
router.get('/', requireAuth, async (req, res) => {
    try {
        const col = await getCollection();
        const users = await col
            .find({}, { projection: { password: 0 } })
            .toArray();
        res.json(users);
    } catch (err) {
        console.error(`GET /${COLLECTION}:`, err.message);
        res.status(500).json({ error: `Failed to fetch ${COLLECTION}` });
    }
});

// Protected: create an admin user (password is hashed before storage)
router.post('/', requireAuth, async (req, res) => {
    const { username, name, email, role, status, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const col = await getCollection();

        // Check for duplicate username
        const existing = await col.findOne({ username });
        if (existing) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await col.insertOne({
            username,
            name,
            email,
            role: role || 'admin',
            status: status || 'active',
            password: hashedPassword,
            createdAt: new Date()
        });
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        console.error(`POST /${COLLECTION}:`, err.message);
        res.status(500).json({ error: `Failed to create user` });
    }
});

// Protected: update a user by ID (re-hashes password if changed)
router.put('/:id', requireAuth, validateId, async (req, res) => {
    try {
        const col = await getCollection();
        const { _id, password, ...updateData } = req.body;

        // If a new password is provided, hash it
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        updateData.updatedAt = new Date();
        await col.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData }
        );
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error(`PUT /${COLLECTION}/${req.params.id}:`, err.message);
        res.status(500).json({ error: `Failed to update user` });
    }
});

// Protected: delete a user by ID
router.delete('/:id', requireAuth, validateId, async (req, res) => {
    try {
        const col = await getCollection();
        await col.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(`DELETE /${COLLECTION}/${req.params.id}:`, err.message);
        res.status(500).json({ error: `Failed to delete user` });
    }
});

module.exports = router;
