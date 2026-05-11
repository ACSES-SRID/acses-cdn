const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('./mongodb');

const router = express.Router();

// Products are consumed by both the public store and admin store manager.
router.get('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const products = await db.collection('store').find({}).toArray();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Prices are normalized to numbers before storage so sorting/calculation works.
router.post('/', async (req, res) => {
  const { name, description, price, originalPrice, category, badge, badgeColor, image } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const result = await db.collection('store').insertOne({
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      category,
      badge,
      badgeColor,
      image
    });
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product' });
  }
});

router.put('/', async (req, res) => {
  const { id, ...updateData } = req.body;
  if (updateData.price) updateData.price = parseFloat(updateData.price);
  if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('store').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

router.delete('/', async (req, res) => {
  const { id } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('store').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;
