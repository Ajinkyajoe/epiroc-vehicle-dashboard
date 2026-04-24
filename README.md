# Epiroc Vehicle Dashboard - Full Stack Challenge

[![Live Demo](https://img.shields.io/badge/Live-Vercel-black?style=for-the-badge&logo=vercel)](https://epiroc-vehicle-dashboard.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-green?style=for-the-badge&logo=render)](https://epiroc-vehicle-dashboard.onrender.com)
[![Database](https://img.shields.io/badge/DB-MongoDB%20Atlas-blue?style=for-the-badge&logo=mongodb)](https://cloud.mongodb.com)

## Overview

Full-stack vehicle dashboard built for the **Epiroc FVT Full-Stack Developer Challenge**. The application displays real-time vehicle telemetry data fetched from a cloud database, with interactive controls to modify backend values. The backend automatically emulates real-time changes to motor RPM, battery levels, and other metrics.

---

## Live Links

| Resource               | URL                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hosted Application** | [https://epiroc-vehicle-dashboard.vercel.app](https://epiroc-vehicle-dashboard.vercel.app)                                                        |
| **Backend API**        | [https://epiroc-vehicle-dashboard.onrender.com](https://epiroc-vehicle-dashboard.onrender.com)                                                    |
| **GitHub Repository**  | [https://github.com/YOUR_USERNAME/epiroc-vehicle-dashboard](https://github.com/YOUR_USERNAME/epiroc-vehicle-dashboard)                            |
| **Read-Only Database** | [MongoDB Atlas Data Explorer](https://cloud.mongodb.com/v2/YOUR_PROJECT_ID#/metrics/replicaSet/YOUR_CLUSTER/explorer/dashboard/vehicledatas/find) |

> **Note:** Replace `YOUR_USERNAME` and `YOUR_PROJECT_ID` with your actual GitHub username and MongoDB Atlas project ID.

---

## Tech Stack

- **Frontend**: React 18, Chart.js (gauges), TailwindCSS, Axios, Lucide React icons
- **Backend**: Node.js, Express, Mongoose, node-cron
- **Database**: MongoDB Atlas (M0 Free Tier)
- **Hosting**: Vercel (Frontend), Render (Backend)

---

## Features

### User Interface

- **Real-time Gauges**: Power output and Motor RPM displayed as animated doughnut charts
- **Status Indicators**: Visual icons for Parking Brake, Check Engine, Motor Status, and Battery Low
- **Telemetry Displays**: Gear Ratio, Battery Percentage, Battery Temperature, and Motor RPM numeric readout
- **Interactive Motor Speed Slider**: Adjust motor speed setting (0-100) with debounced updates to backend
- **Charging Toggle**: Start/Stop charging button that affects battery drain/charge behavior

### Backend & Database

- **Cloud Database**: All vehicle values stored in MongoDB Atlas and fetched on every request
- **Real-time Emulation**: Backend cron job runs every 3 seconds to simulate live vehicle data changes:
  - Motor RPM fluctuates around the speed setting
  - Power output scales with RPM
  - Battery percentage drains slowly (or charges when charging is active)
  - Battery temperature varies with battery level
  - High-speed and low-battery flags computed automatically
- **REST API Endpoints**:
  - `GET /api/vehicle` - Retrieve current vehicle data
  - `POST /api/vehicle` - Update specific vehicle fields
  - `GET /health` - Check backend and database connection status
- **Fallback Mode**: Application works in memory mode if MongoDB is unavailable

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- MongoDB Atlas account (free tier)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/epiroc-vehicle-dashboard.git
cd epiroc-vehicle-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/dashboard?retryWrites=true&w=majority
PORT=5000
```

> **Important:** Replace the connection string with your MongoDB Atlas URI. Ensure special characters in the password are URL-encoded (e.g., `@` → `%40`, `#` → `%23`).

Start the backend:

```bash
npm start
```

The server will run on `http://localhost:5000`. You should see `✅ MongoDB connected` if the database connection is successful.

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
```

Create a `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

The application will open at `http://localhost:3000`.

---

## API Documentation

| Method | Endpoint       | Description                       | Request Body             |
| ------ | -------------- | --------------------------------- | ------------------------ |
| GET    | `/`            | API info and available endpoints  | -                        |
| GET    | `/api/vehicle` | Fetch all current vehicle data    | -                        |
| POST   | `/api/vehicle` | Update vehicle fields             | `{ "fieldName": value }` |
| GET    | `/health`      | Check backend and database status | -                        |

### Example: Update Motor Speed

```bash
curl -X POST http://localhost:5000/api/vehicle \
  -H "Content-Type: application/json" \
  -d '{"motorSpeedSetting": 75}'
```

### Example: Toggle Charging

```bash
curl -X POST http://localhost:5000/api/vehicle \
  -H "Content-Type: application/json" \
  -d '{"isCharging": true}'
```

---

## Database Access

The application uses MongoDB Atlas with a `dashboard` database and `vehicledatas` collection.

**Read-Only Access:**

- Atlas Data Explorer: [View Collection](https://cloud.mongodb.com/v2/YOUR_PROJECT_ID#/metrics/replicaSet/YOUR_CLUSTER/explorer/dashboard/vehicledatas/find)
- Database Name: `dashboard`
- Collection Name: `vehicledatas`

> **Note:** Update the Data Explorer link with your actual MongoDB Atlas project and cluster IDs.

---

## Project Structure

```
epiroc-vehicle-dashboard/
├── backend/
│   ├── server.js          # Express API + MongoDB connection + cron emulation
│   ├── package.json       # Node.js dependencies
│   └── .env               # MongoDB URI (not committed)
├── frontend/
│   ├── src/
│   │   ├── App.js         # Dashboard UI with gauges and controls
│   │   ├── index.js       # React entry point
│   │   └── index.css      # TailwindCSS styles
│   ├── public/
│   │   └── index.html
│   ├── package.json       # React dependencies
│   ├── tailwind.config.js
│   └── postcss.config.js
├── README.md              # This file
└── .gitignore             # Excludes node_modules, .env
```

---

## Deployment

### Backend (Render)

1. Connect GitHub repository to [Render](https://render.com)
2. Create a new Web Service with root directory `backend`
3. Set environment variable `MONGODB_URI` with your Atlas connection string
4. Deploy — URL: `https://epiroc-vehicle-dashboard.onrender.com`

### Frontend (Vercel)

1. Connect GitHub repository to [Vercel](https://vercel.com)
2. Create a new Project with framework preset `Create React App` and root directory `frontend`
3. Set environment variable `REACT_APP_API_URL` to `https://epiroc-vehicle-dashboard.onrender.com/api`
4. Deploy — URL: `https://epiroc-vehicle-dashboard.vercel.app`

---

## Submission Checklist

| Requirement                     | Status | Link                                                                     |
| ------------------------------- | ------ | ------------------------------------------------------------------------ |
| Static URL (Hosted Application) | ✅     | [Vercel Live Demo](https://epiroc-vehicle-dashboard.vercel.app)          |
| GitHub Repository               | ✅     | [Source Code](https://github.com/YOUR_USERNAME/epiroc-vehicle-dashboard) |
| README with Setup Instructions  | ✅     | This file                                                                |
| Read-Only Public Database       | ✅     | [MongoDB Atlas Data Explorer](https://cloud.mongodb.com)                 |

---

## Troubleshooting

### MongoDB Connection Fails

- Verify `MONGODB_URI` is spelled correctly in environment variables
- Ensure the password does not contain angle brackets `<>` — remove them
- URL-encode special characters in the password (`@` → `%40`, `#` → `%23`, `:` → `%3A`)
- Check Atlas **Network Access** → allow `0.0.0.0/0` (Allow from Anywhere)
- Confirm the URI includes `/dashboard?retryWrites=true&w=majority`

### Frontend Shows "Loading Dashboard..."

- Verify `REACT_APP_API_URL` points to the correct backend URL
- Check backend `/health` endpoint responds with `{ "status": "OK" }`
- Open browser DevTools → Network tab to inspect API errors

### CORS Errors

- Backend already includes `app.use(cors())`
- If issues persist, update `backend/server.js` to: `app.use(cors({ origin: "*" }))`

---

## License

Challenge submission for Epiroc FVT Inc. All rights reserved.
