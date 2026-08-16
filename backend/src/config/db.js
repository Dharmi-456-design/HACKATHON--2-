const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenwatch';
  if (!process.env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI not specified in environment. Defaulting to mongodb://127.0.0.1:27017/greenwatch');
  }
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;

