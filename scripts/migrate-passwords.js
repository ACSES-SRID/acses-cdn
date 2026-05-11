/**
 * Migration script — hashes all existing plain-text passwords in the users collection.
 *
 * This is a one-time migration for users created before bcrypt hashing was added.
 * Bcrypt hashes always start with "$2a$" or "$2b$", so already-hashed passwords
 * are automatically skipped.
 *
 * Usage:
 *   node scripts/migrate-passwords.js
 *
 * Make sure your .env file has MONGODB_URI set before running.
 */

require('dotenv').config();

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function migrate() {
    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI is not set in .env');
        process.exit(1);
    }

    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db('acses-website');
        const users = db.collection('users');

        const allUsers = await users.find({}).toArray();
        let migrated = 0;
        let skipped = 0;

        for (const user of allUsers) {
            // Bcrypt hashes start with "$2a$" or "$2b$" — skip already-hashed passwords
            if (user.password && user.password.startsWith('$2')) {
                skipped++;
                console.log(`  Skipped "${user.username}" (already hashed)`);
                continue;
            }

            if (!user.password) {
                console.log(`  Skipped "${user.username}" (no password field)`);
                skipped++;
                continue;
            }

            const hashed = await bcrypt.hash(user.password, 10);
            await users.updateOne(
                { _id: user._id },
                { $set: { password: hashed, updatedAt: new Date() } }
            );
            migrated++;
            console.log(`  Migrated "${user.username}"`);
        }

        console.log('');
        console.log(`Done. ${migrated} password(s) hashed, ${skipped} skipped.`);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

migrate();
