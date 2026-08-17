const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/naturepulse';
  if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI / MONGODB_URI not specified in environment. Defaulting to local fallback.');
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`⚠️ MongoDB connection error: ${err.message}. Running server in resilient memory fallback mode.`);
    return null;
  }
};

module.exports = connectDB;

