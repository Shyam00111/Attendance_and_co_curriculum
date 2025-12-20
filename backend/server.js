// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Verify environment variables are loaded
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET not found in environment variables!");
  process.exit(1);
}

const app = express();

// Connect to Database
const dbConnection = connectDB();

// Middlewares
app.use(cors({
    origin: ['http://localhost:5173','http://localhost:8081'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: 'GET, POST, PUT, DELETE',
  }));
app.use(express.json());

// Debug endpoint to check DB connection
app.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    res.json({
      db: states[dbState] || 'unknown',
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Default route
app.use('/auth', require('./routes/auth'));
app.use('/attendance', require('./routes/attendance'));
app.use('/activity', require('./routes/activity'));
app.use('/students', require('./routes/student'));
app.use('/subjects', require('./routes/subject'));
app.use('/enrollment', require('./routes/enrollment'));
app.use('/certificates', require('./routes/certificate'));
app.use('/chatbot', require('./routes/chatbot'));
app.use('/export', require('./routes/export'));
// app.use('/notifications', require('./routes/notification'));
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
