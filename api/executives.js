const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const clientPromise = require('./mongodb');

// Legacy executive endpoint. Note that this uses the `acses` database while
// most newer routes use `acses-website`.
// GET: Fetch all executives
router.get('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses');
    const data = await db.collection('executives').find({}).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Create a new executive
router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses');
    const result = await db.collection('executives').insertOne(req.body);
    res.json({ id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT: Update an executive
router.put('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses');
    const { id, ...updateData } = req.body;
    await db.collection('executives').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.json({ id, ...updateData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Delete an executive
router.delete('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses');
    const { id } = req.body;
    await db.collection('executives').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
