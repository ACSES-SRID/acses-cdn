const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('./mongodb');

const router = express.Router();

// List every event for the public events section and admin dashboard.
router.get('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const events = await db.collection('events').find({}).toArray();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Create an event from the admin dashboard.
router.post('/', async (req, res) => {
  const { title, date, venue, description, category, status, flyer } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const result = await db.collection('events').insertOne({
      title,
      date,
      venue,
      description,
      category,
      status,
      flyer,
      createdAt: new Date()
    });
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Update an event by MongoDB document id supplied in the JSON body.
router.put('/', async (req, res) => {
  const { id, ...updateData } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('events').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete an event by MongoDB document id supplied in the JSON body.
router.delete('/', async (req, res) => {
  const { id } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('events').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router;
