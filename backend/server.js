// backend/server.js
require('dotenv').config();
const whatsappRoutes = require("./routes/whatsapp");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const propertyRoutes = require("./routes/property");


// ========================================
// Use Google DNS for MongoDB SRV lookup
// ========================================
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// ========================================
// Middleware
// ========================================
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use("/api/whatsapp", whatsappRoutes);

// Serve uploaded property images
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// ========================================
// Root Route
// ========================================
app.get('/', (req, res) => {
  res.send('Connected successfully. API: GET /api');
});

// ========================================
// MongoDB Connection
// ========================================
console.log('Connecting to MongoDB...');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB Connected');
  })
  .catch((err) => {
    console.error('✗ MongoDB Error:', err.message);
  });

// ========================================
// Import Routes
// ========================================
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const leadRoutes = require('./routes/leads');
const dashboardRoutes = require('./routes/dashboard');

// ========================================
// API Routes
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/dashboard', dashboardRoutes);


// ========================================
// API Root Route
// ========================================
app.get('/api', (req, res) => {
  res.json({
    message: 'Real Estate CRM API is working',
    status: 'success'
  });
});

// ========================================
// Health Check
// ========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date()
  });
});

// ========================================
// 404 Handler
// ========================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// ========================================
// Error Handling
// ========================================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// ========================================
// Start Server
// ========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('========================================');
  console.log('   REAL ESTATE CRM BACKEND');
  console.log('========================================');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Website: http://localhost:${PORT}`);
  console.log(`✓ API:     http://localhost:${PORT}/api`);
  console.log(`✓ Health:  http://localhost:${PORT}/api/health`);
  console.log('========================================');
});