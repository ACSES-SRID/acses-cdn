const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('./mongodb');

const router = express.Router();

// Gallery items store image URLs and metadata used by the public gallery.
router.get('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const gallery = await db.collection('gallery').find({}).toArray();
    res.status(200).json(gallery);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery' });
  }
});

// Add an image record; actual image upload/storage is handled outside this route.
router.post('/', async (req, res) => {
  const { src, alt, description, category } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const result = await db.collection('gallery').insertOne({
      src,
      alt,
      description,
      category
    });
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding gallery item' });
  }
});

router.put('/', async (req, res) => {
  const { id, ...updateData } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('gallery').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating gallery item' });
  }
});

router.delete('/', async (req, res) => {
  const { id } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('gallery').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gallery item' });
  }
});

module.exports = router;
