/**
 * Epiroc Vehicle Dashboard - Backend Server
 *
 * This Express.js server provides REST APIs for the vehicle dashboard
 * frontend. It connects to MongoDB Atlas for persistent data storage
 * and runs a cron job to emulate real-time vehicle telemetry changes.
 *
 * Features:
 * - MongoDB connection with fallback to in-memory storage
 * - REST API endpoints for reading and updating vehicle data
 * - Automatic real-time data emulation (motor RPM, battery, temperature)
 * - Health check endpoint for monitoring
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins — required for Vercel frontend to access Render backend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors());

// Parse JSON request bodies
app.use(express.json());

/**
 * In-memory fallback store
 * Used when MongoDB is unavailable so the app continues to work
 */
let memoryStore = {
  _id: 'vehicle',
  parkingBrake: false,
  checkEngine: false,
  motorHighSpeed: false,
  batteryLow: false,
  power: 50,
  motorRPM: 1500,
  gearRatio: '2.5:1',
  batteryPercent: 75,
  batteryTemp: 25,
  motorRPMNumeric: 1500,
  motorSpeedSetting: 50,
  isCharging: false
};

// Flag to track whether we're using in-memory fallback mode
let useMemory = false;

// Mongoose model for vehicle data (initialized after schema definition)
let Vehicle;

/**
 * Connect to MongoDB Atlas
 * Falls back to in-memory storage if connection fails
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dashboard';

  // Diagnostic: show what we are trying to connect to
  if (process.env.MONGODB_URI) {
    console.log('📝 MONGODB_URI is set in environment');
  } else {
    console.warn('📝 MONGODB_URI is NOT set — falling back to local MongoDB');
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
    useMemory = false;
  } catch (err) {
    console.error('\n❌ MongoDB connection failed');
    console.error('   Error:', err.message);
    console.error('\n🔍 Troubleshooting hints:');
    console.error('   1. Is MONGODB_URI spelled exactly right in backend/.env?');
    console.error('   2. Did you replace <password> with your actual password?');
    console.error('   3. Does your password contain @ : / # ? & = + $ , % ?');
    console.error('      → If so, URL-encode it (e.g. @ → %40, # → %23)');
    console.error('   4. In Atlas → Network Access → is 0.0.0.0/0 (Allow from Anywhere) added?');
    console.error('   5. Does the URI end with /dashboard?retryWrites=true&w=majority');
    console.error('\n⚠️  Starting in in-memory fallback mode...\n');
    useMemory = true;
  }
}

/**
 * MongoDB Schema for vehicle telemetry data
 * Stores all values displayed on the frontend dashboard
 */
const VehicleSchema = new mongoose.Schema({
  _id: { type: String, default: 'vehicle' },
  parkingBrake: { type: Boolean, default: false },
  checkEngine: { type: Boolean, default: false },
  motorHighSpeed: { type: Boolean, default: false },
  batteryLow: { type: Boolean, default: false },
  power: { type: Number, default: 50 },
  motorRPM: { type: Number, default: 1500 },
  gearRatio: { type: String, default: '2.5:1' },
  batteryPercent: { type: Number, default: 75 },
  batteryTemp: { type: Number, default: 25 },
  motorRPMNumeric: { type: Number, default: 1500 },
  motorSpeedSetting: { type: Number, default: 50 },
  isCharging: { type: Boolean, default: false }
});

// Create the Mongoose model
Vehicle = mongoose.model('VehicleData', VehicleSchema);

/**
 * Initialize database with default values if no document exists
 */
async function initData() {
  if (useMemory) return;
  try {
    let doc = await Vehicle.findById('vehicle');
    if (!doc) {
      doc = new Vehicle({ ...memoryStore });
      await doc.save();
      console.log('✅ Initial data created in MongoDB');
    }
  } catch (err) {
    console.warn('⚠️  Could not init MongoDB data:', err.message);
  }
}

/**
 * Compute derived fields based on current telemetry values
 * - motorHighSpeed: true when RPM exceeds 4000
 * - batteryLow: true when battery drops below 20%
 */
function computeDerived(data) {
  data.motorHighSpeed = data.motorRPM > 4000;
  data.batteryLow = data.batteryPercent < 20;
  return data;
}

// ───────────────────────────────────────────────
// API Routes
// ───────────────────────────────────────────────

/**
 * GET /api/vehicle
 * Fetch all current vehicle data from the database
 * Returns computed derived fields and updates the database
 */
app.get('/api/vehicle', async (req, res) => {
  try {
    if (useMemory) {
      return res.json(computeDerived({ ...memoryStore }));
    }
    const data = await Vehicle.findById('vehicle').lean();
    if (!data) return res.status(404).json({ error: 'No data' });
    computeDerived(data);
    await Vehicle.findByIdAndUpdate('vehicle', data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/vehicle
 * Update specific vehicle fields in the database
 * Request body: { "fieldName": value }
 */
app.post('/api/vehicle', async (req, res) => {
  try {
    if (useMemory) {
      memoryStore = { ...memoryStore, ...req.body };
      return res.json({ success: true, mode: 'memory' });
    }
    await Vehicle.findByIdAndUpdate('vehicle', req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /
 * Root endpoint showing API info and available endpoints
 */
app.get('/', (req, res) => res.json({
  message: 'Epiroc Vehicle Dashboard API',
  endpoints: {
    vehicle: '/api/vehicle',
    health: '/health'
  }
}));

/**
 * GET /health
 * Health check endpoint — reports backend and database connection status
 */
app.get('/health', (req, res) => res.json({ status: 'OK', mode: useMemory ? 'memory' : 'mongodb' }));

// ───────────────────────────────────────────────
// Real-Time Data Emulation (Cron Job)
// ───────────────────────────────────────────────

/**
 * Cron job runs every 3 seconds to simulate live vehicle data changes:
 * - Motor RPM fluctuates around the speed setting
 * - Power scales proportionally with RPM
 * - Battery drains when not charging, charges when charging is active
 * - Battery temperature varies with battery level
 */
cron.schedule('*/3 * * * * *', async () => {
  let data;
  if (useMemory) {
    data = memoryStore;
  } else {
    try {
      data = await Vehicle.findById('vehicle').lean();
      if (!data) return;
    } catch (err) {
      return; // silently skip if DB error
    }
  }

  // Motor RPM fluctuates around the speed setting (base = setting * 50)
  const baseRPM = data.motorSpeedSetting * 50;
  data.motorRPM = data.motorRPMNumeric = Math.max(0, Math.round(baseRPM + (Math.random() - 0.5) * 1000));
  data.motorHighSpeed = data.motorRPM > 4000;

  // Power output is proportional to RPM (capped at 100%)
  data.power = Math.min(100, Math.round(data.motorRPM / 50));

  // Battery logic: drain when discharging, charge when charging
  if (!data.isCharging) {
    data.batteryPercent = Math.max(0, data.batteryPercent - 0.5);
  } else {
    data.batteryPercent = Math.min(100, data.batteryPercent + 1);
  }

  // Battery temperature varies with battery level plus small random fluctuation
  data.batteryTemp = +(20 + (data.batteryPercent / 5) + (Math.random() - 0.5) * 10).toFixed(1);
  data.batteryLow = data.batteryPercent < 20;

  // Save updated data back to storage
  if (useMemory) {
    memoryStore = data;
  } else {
    try {
      await Vehicle.findByIdAndUpdate('vehicle', data);
    } catch (err) {
      // silently skip
    }
  }
});

// ───────────────────────────────────────────────
// Start Server
// ───────────────────────────────────────────────

connectDB().then(() => {
  initData();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/vehicle`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
  });
});

