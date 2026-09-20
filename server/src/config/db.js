const mongoose = require('mongoose');
const config = require('./env');

let memoryServerInstance = null;

const connectDB = async () => {
  try {
    // Attempt connecting to the configured MONGODB_URI
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[QuickCourt DB] Connected to MongoDB at: ${config.MONGODB_URI}`);
  } catch (err) {
    console.warn(`[QuickCourt DB] Local MongoDB connection failed: ${err.message}`);
    console.log('[QuickCourt DB] Initializing embedded MongoMemoryServer fallback for seamless development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const inMemoryUri = memoryServerInstance.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[QuickCourt DB] Successfully connected to Embedded MongoDB at: ${inMemoryUri}`);
    } catch (fallbackErr) {
      console.error('[QuickCourt DB] Fatal error connecting to database:', fallbackErr);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    console.log('[QuickCourt DB] Database disconnected successfully.');
  } catch (err) {
    console.error('[QuickCourt DB] Error disconnecting:', err);
  }
};

module.exports = { connectDB, disconnectDB };
