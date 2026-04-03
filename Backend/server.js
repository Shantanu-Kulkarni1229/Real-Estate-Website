/**
 * REAL ESTATE BACKEND - MAIN SERVER FILE
 * ======================================
 * Entry point for the Node.js/Express server
 * 
 * Description:
 * - Initializes Express app
 * - Connects to MongoDB
 * - Sets up middleware
 * - Initializes routes
 * - Handles global errors
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// ==================== MIDDLEWARE ====================
// Security headers
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE CONNECTION ====================
/**
 * MongoDB Connection
 * - Connects to MongoDB using Mongoose
 * - Uses the URI from .env file
 * - Includes error handling
 */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('✗ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });

// ==================== ROUTES ====================
// Health Check Route
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Real Estate Backend API is running',
    timestamp: new Date()
  });
});

app.use('/api/v1/google-sheets', require('./routes/googleSheets.routes'));
app.use('/api/v1/uploads', require('./routes/upload.routes'));

// TODO: Import and use route files when created
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/users.routes'));
// app.use('/api/v1/properties', require('./routes/properties.routes'));
// app.use('/api/v1/interests', require('./routes/interests.routes'));
// app.use('/api/v1/admin', require('./routes/admin.routes'));

// ==================== ERROR HANDLING ====================
// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Real Estate Backend Server Running      ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
║   MongoDB: Connected                      ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
