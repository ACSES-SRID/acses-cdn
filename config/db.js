const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env');
}

// Reuse one MongoDB connection during development so hot reloads do not create
// a new database connection on every server restart.
if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production, keep a single process-level connection promise.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

module.exports = clientPromise;
