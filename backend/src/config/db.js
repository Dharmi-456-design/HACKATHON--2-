const mongoose = require('mongoose');

const connectDB = async () => {
  const remoteUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/naturepulse';

  if (remoteUri) {
    try {
      const conn = await mongoose.connect(remoteUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ Remote MongoDB Atlas connection warning: ${err.message}. Attempting local MongoDB connection...`);
    }
  }

  try {
    const localConn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ Local MongoDB connected: ${localConn.connection.host}`);
    return localConn;
  } catch (localErr) {
    console.error(`⚠️ Local MongoDB connection error: ${localErr.message}. Running server in memory fallback mode.`);
    mongoose.set('bufferCommands', false);
    return null;
  }
};

module.exports = connectDB;

