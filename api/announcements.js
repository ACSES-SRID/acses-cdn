const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('./mongodb');

const router = express.Router();

// Announcements power the admin notifications and public news-style content.
router.get('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const announcements = await db.collection('announcements').find({}).toArray();
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

// Store a new announcement with publication status and visibility metadata.
router.post('/', async (req, res) => {
  const { title, body, date, visibility, status, author } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const result = await db.collection('announcements').insertOne({
      title,
      body,
      date,
      visibility,
      status,
      author,
      createdAt: new Date()
    });
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement' });
  }
});

// Update an existing announcement by id.
router.put('/', async (req, res) => {
  const { id, ...updateData } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('announcements').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating announcement' });
  }
});

// Remove an announcement by id.
router.delete('/', async (req, res) => {
  const { id } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('announcements').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement' });
  }
});

module.exports = router;
