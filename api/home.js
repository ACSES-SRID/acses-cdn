const express = require('express');
const clientPromise = require('./mongodb');

const router = express.Router();

// The home collection is treated as a single editable document.
router.get('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const home = await db.collection('home').findOne({});
    if (!home) {
      return res.status(200).json({ presidentMessage: '', hodMessage: '', statistics: {} });
    }
    res.status(200).json(home);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching home data' });
  }
});

// Replace existing home content so there is only one active home document.
router.post('/', async (req, res) => {
  const { presidentMessage, hodMessage, statistics } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('home').deleteMany({});
    const result = await db.collection('home').insertOne({
      presidentMessage,
      hodMessage,
      statistics,
      updatedAt: new Date()
    });
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error saving home data' });
  }
});

// PUT follows the same single-document replacement model as POST.
router.put('/', async (req, res) => {
  const { presidentMessage, hodMessage, statistics } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('home').deleteMany({});
    await db.collection('home').insertOne({
      presidentMessage,
      hodMessage,
      statistics,
      updatedAt: new Date()
    });
    res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating home data' });
  }
});

module.exports = router;
