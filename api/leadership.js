const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('./mongodb');

const router = express.Router();

// Leadership records power the public leadership page and admin editor.
router.get('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const executives = await db.collection('leadership').find({}).toArray();
    res.status(200).json(executives);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching executives' });
  }
});

// Store one leadership profile with image URL and role metadata.
router.post('/', async (req, res) => {
  const { name, role, image, icon, description } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const result = await db.collection('leadership').insertOne({
      name,
      role,
      image,
      icon,
      description
    });
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding executive' });
  }
});

router.put('/', async (req, res) => {
  const { id, ...updateData } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('leadership').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating executive' });
  }
});

router.delete('/', async (req, res) => {
  const { id } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('leadership').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting executive' });
  }
});

module.exports = router;
