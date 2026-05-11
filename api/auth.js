const express = require('express');
const bcrypt = require('bcryptjs');
const clientPromise = require('./mongodb');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // ADMIN_PASSWORD is expected to be a bcrypt hash, not a plain text password.
  const isValid = await bcrypt.compare(password, adminPassword);

  if (isValid) {
    res.status(200).json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

module.exports = router;
