const express = require('express');
const { ObjectId } = require('mongodb');
const clientPromise = require('./mongodb');

const router = express.Router();

// Projects are shown publicly and also managed from the admin dashboard.
router.get('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const projects = await db.collection('studentProjects').find({}).toArray();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Add a student project. Approval/moderation should be added before production.
router.post('/', async (req, res) => {
  const { title, description, technologies, image, github, demo, video } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    const result = await db.collection('studentProjects').insertOne({
      title,
      description,
      technologies,
      image,
      github,
      demo,
      video
    });
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding project' });
  }
});

router.put('/', async (req, res) => {
  const { id, ...updateData } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('studentProjects').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project' });
  }
});

router.delete('/', async (req, res) => {
  const { id } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db('acses-website');
    await db.collection('studentProjects').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

module.exports = router;
