// config/db.js
const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log('Attempting to connect to MongoDB...');
    console.log('URI (first 50 chars):', uri.substring(0, 50) + '...');
    
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
    console.log('Database:', mongoose.connection.name);
    console.log('State:', mongoose.connection.readyState);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    return mongoose.connection;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
};
module.exports = connectDB;
