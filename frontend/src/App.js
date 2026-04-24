/**
 * Epiroc Vehicle Dashboard - Frontend Application
 *
 * This React application displays a real-time vehicle dashboard interface
 * that fetches telemetry data from the backend API and allows user
 * interactions to modify backend values.
 *
 * Features:
 * - Real-time data fetching every 2 seconds
 * - Animated gauge charts for power and RPM
 * - Status indicator icons with color-coded states
 * - Interactive motor speed slider with debounced updates
 * - Charging toggle button
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  AlertCircle, Battery, Zap, Settings, 
  Menu, Plug
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components for the gauge charts
ChartJS.register(ArcElement, Tooltip, Legend);

// API base URL: uses environment variable in production, falls back to relative path
const API_BASE = process.env.REACT_APP_API_URL || '/api';

/**
 * Gauge Component
 * Renders a semi-circular doughnut chart to display a single metric
 * @param {number} value - Current value to display
 * @param {number} max - Maximum value for the gauge scale
 * @param {string} label - Label shown below the gauge
 * @param {string} color - Color for the active portion of the gauge
 */
function Gauge({ value, max = 100, label, color = '#4ade80' }) {
  const data = {
    labels: [label, ' '],
    datasets: [{
      data: [value, max - value],
      backgroundColor: [color, '#1e293b'],
      borderWidth: 0
    }]
  };

  const options = {
    rotation: -90,
    circumference: 180,
    cutout: '70%',
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-24 h-24">
        <Doughnut data={data} options={options} />
      </div>
      <span className="text-sm font-mono">{value}</span>
      <span className="text-xs opacity-75">{label}</span>
    </div>
  );
}

/**
 * Main App Component
 * Manages vehicle data state, polling, and user interactions
 */
function App() {
  // Vehicle telemetry data from the backend
  const [data, setData] = useState({
    parkingBrake: false, checkEngine: false, motorHighSpeed: false, batteryLow: false,
    power: 0, motorRPM: 0, gearRatio: '', batteryPercent: 0, batteryTemp: 0,
    motorRPMNumeric: 0, motorSpeedSetting: 50, isCharging: false
  });
  
  // Local slider state (separate from data to allow smooth dragging)
  const [sliderValue, setSliderValue] = useState(50);
  
  // Loading state shown on initial data fetch
  const [loading, setLoading] = useState(true);

  /**
   * Fetch vehicle data from the backend API
   * Updates both the display data and slider position
   */
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/vehicle`);
      setData(res.data);
      setSliderValue(res.data.motorSpeedSetting);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a specific field on the backend
   * Used for motor speed slider and charging toggle
   * @param {string} field - Field name to update
   * @param {any} value - New value for the field
   */
  const updateField = async (field, value) => {
    try {
      await axios.post(`${API_BASE}/vehicle`, { [field]: value });
      fetchData(); // Refresh data after update
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  /**
   * Debounced slider update effect
   * Waits 300ms after the user stops dragging before sending to backend
   * Prevents excessive API calls during slider movement
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (sliderValue !== data.motorSpeedSetting) {
        updateField('motorSpeedSetting', sliderValue);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [sliderValue]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Polling effect: fetch data immediately on mount, then every 2 seconds
   * Cleans up interval on unmount to prevent memory leaks
   */
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Show loading screen until first successful data fetch
  if (loading) return <div className="flex items-center justify-center h-screen">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 font-mono">
      
      {/* Top Row: Status Indicator Icons */}
      <div className="mb-8 flex gap-6 justify-center">
        {/* Parking Brake indicator - red when engaged, green when disengaged */}
        <div className={`flex flex-col items-center p-4 rounded-lg ${data.parkingBrake ? 'bg-red-500/20 border-red-500' : 'bg-green-500/20 border-green-500 border-2'}`}>
          <Plug className="w-12 h-12" />
          <span className="text-sm mt-1">Parking Brake</span>
        </div>
        
        {/* Check Engine indicator - yellow when on, green when off */}
        <div className={`flex flex-col items-center p-4 rounded-lg ${data.checkEngine ? 'bg-yellow-500/20 border-yellow-500' : 'bg-green-500/20 border-green-500 border-2'}`}>
          <AlertCircle className="w-12 h-12" />
          <span>Check Engine</span>
        </div>
        
        {/* Motor Status indicator - orange at high speed, green at normal */}
        <div className={`flex flex-col items-center p-4 rounded-lg ${data.motorHighSpeed ? 'bg-orange-500/20 border-orange-500' : 'bg-green-500/20 border-green-500 border-2'}`}>
          <Zap className="w-12 h-12" />
          <span>Motor Status</span>
        </div>
        
        {/* Battery Low indicator - red when low, green when normal */}
        <div className={`flex flex-col items-center p-4 rounded-lg ${data.batteryLow ? 'bg-red-500/20 border-red-500' : 'bg-green-500/20 border-green-500 border-2'}`}>
          <Battery className="w-12 h-12" />
          <span>Battery Low</span>
        </div>
      </div>

      {/* Middle Row: Gauge Charts and Numeric Displays */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 justify-items-center items-center">
        {/* Power gauge (0-100%) */}
        <Gauge value={data.power} max={100} label="PWR" color="#3b82f6" />
        
        {/* RPM gauge (scaled to 0-100 for display) */}
        <Gauge value={data.motorRPM / 50} max={100} label="RPM" color="#f59e0b" />
        
        {/* Gear Ratio display */}
        <div className="text-center">
          <div className="text-2xl font-bold">{data.gearRatio}</div>
          <span className="text-sm opacity-75">Gear Ratio</span>
        </div>
        
        {/* Battery Percentage display */}
        <div className="text-center">
          <div className="text-3xl font-bold">{data.batteryPercent}%</div>
          <span>Battery</span>
        </div>
        
        {/* Battery Temperature display */}
        <div className="text-center">
          <div className="text-2xl">{data.batteryTemp.toFixed(1)}°C</div>
          <span>Batt Temp</span>
        </div>
        
        {/* Motor RPM numeric readout */}
        <div className="text-center col-span-2 md:col-span-1">
          <div className="text-4xl font-bold">{data.motorRPMNumeric.toLocaleString()}</div>
          <span>Motor RPM</span>
        </div>
      </div>

      {/* Motor Speed Slider - user can adjust 0-100 */}
      <div className="mb-12 flex flex-col items-center gap-4">
        <label className="text-lg">Motor Speed Setting</label>
        <input
          type="range"
          min="0" max="100" step="1"
          value={sliderValue}
          onChange={(e) => setSliderValue(+e.target.value)}
          className="w-96 h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span>{sliderValue}</span>
      </div>

      {/* Bottom Row: Control Buttons */}
      <div className="flex flex-wrap gap-4 justify-center items-center">
        {/* Placeholder buttons for future views */}
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2" onClick={() => console.log('Gear view')}>
          <Settings /> Gear
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2" onClick={() => console.log('Motor view')}>
          <Zap /> Motor
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2" onClick={() => console.log('Batt Temp view')}>
          <Battery /> Batt Temp
        </button>
        <button className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2" onClick={() => console.log('View Menu')}>
          <Menu /> View Menu
        </button>
        
        {/* Charging toggle - changes color based on state */}
        <button
          className={`px-8 py-3 rounded-lg flex items-center gap-2 font-bold transition-all ${
            data.isCharging
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25'
          }`}
          onClick={() => updateField('isCharging', !data.isCharging)}
        >
          <Plug />
          {data.isCharging ? 'Stop Charging' : 'Start Charging'}
        </button>
      </div>
    </div>
  );
}

export default App;

