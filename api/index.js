const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../backend/config/database');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/users', require('../backend/routes/users'));
app.use('/api/chats', require('../backend/routes/chats'));
app.use('/api/messages', require('../backend/routes/messages'));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;