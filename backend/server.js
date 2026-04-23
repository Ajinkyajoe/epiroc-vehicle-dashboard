const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback store (works even without MongoDB)
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

let useMemory = false;
let Vehicle;

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

Vehicle = mongoose.model('VehicleData', VehicleSchema);

// Initialize data
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

// Compute derived fields
function computeDerived(data) {
  data.motorHighSpeed = data.motorRPM > 4000;
  data.batteryLow = data.batteryPercent < 20;
  return data;
}

// APIs
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

app.get('/health', (req, res) => res.json({ status: 'OK', mode: useMemory ? 'memory' : 'mongodb' }));

// Real-time emulation cron every 3 seconds
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

  // Motor RPM fluctuates around setting
  const baseRPM = data.motorSpeedSetting * 50;
  data.motorRPM = data.motorRPMNumeric = Math.max(0, Math.round(baseRPM + (Math.random() - 0.5) * 1000));
  data.motorHighSpeed = data.motorRPM > 4000;

  // Power proportional to RPM
  data.power = Math.min(100, Math.round(data.motorRPM / 50));

  // Battery logic
  if (!data.isCharging) {
    data.batteryPercent = Math.max(0, data.batteryPercent - 0.5);
  } else {
    data.batteryPercent = Math.min(100, data.batteryPercent + 1);
  }
  data.batteryTemp = +(20 + (data.batteryPercent / 5) + (Math.random() - 0.5) * 10).toFixed(1);
  data.batteryLow = data.batteryPercent < 20;

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

// Start
connectDB().then(() => {
  initData();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/vehicle`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
  });
});

