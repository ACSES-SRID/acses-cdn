const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('./mongodb');

const router = express.Router();

// Return resources grouped by section so the frontend can render each area
// without re-filtering a flat list.
router.get('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const academic = await db.collection('resources').find({ type: 'academic' }).toArray();
    const tools = await db.collection('resources').find({ type: 'tools' }).toArray();
    const career = await db.collection('resources').find({ type: 'career' }).toArray();
    res.status(200).json({ academic, tools, career });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

// Add one resource record. The `type` field decides which section it appears in.
router.post('/', async (req, res) => {
  const { type, ...data } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const result = await db.collection('resources').insertOne({ type, ...data });
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding resource' });
  }
});

router.put('/', async (req, res) => {
  const { id, ...updateData } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('resources').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating resource' });
  }
});

router.delete('/', async (req, res) => {
  const { id } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('resources').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resource' });
  }
});

module.exports = router;
