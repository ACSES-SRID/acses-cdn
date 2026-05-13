/**
 * Seed script — creates the first admin user with a hashed password.
 *
 * Usage:
 *   node scripts/seed.js
 *
 * Make sure your .env file has MONGODB_URI set before running.
 */

require('dotenv').config();

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Change this before running!
const ADMIN_NAME = 'Administrator';
const ADMIN_EMAIL = 'admin@acses.com';

async function seed() {
    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI is not set in .env');
        process.exit(1);
    }

    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db('acses-website');
        const users = db.collection('users');

        // Check if admin user already exists
        const existing = await users.findOne({ username: ADMIN_USERNAME });
        if (existing) {
            console.log(`User "${ADMIN_USERNAME}" already exists. Skipping.`);
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await users.insertOne({
            username: ADMIN_USERNAME,
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            role: 'admin',
            status: 'active',
            password: hashedPassword,
            createdAt: new Date()
        });

        console.log(`Admin user "${ADMIN_USERNAME}" created successfully.`);
        console.log('');
        console.log('⚠️  IMPORTANT: Change the default password immediately!');
        console.log('   You can update it via the admin dashboard or by running');
        console.log('   this script again with a new ADMIN_PASSWORD value.');
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

seed();
