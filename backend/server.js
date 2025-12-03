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
connectDB();

// Middlewares
app.use(cors({
    origin: ['','http://localhost:8081'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: 'GET, POST, PUT, DELETE',
  }));
app.use(express.json());

// Default route
app.use('/auth', require('./routes/auth'));
app.use('/attendance', require('./routes/attendance'));
app.use('/activity', require('./routes/activity'));
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
