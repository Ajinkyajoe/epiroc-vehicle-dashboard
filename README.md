# Epiroc Vehicle Dashboard

[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge&logo=vercel)](https://epiroc-vehicle-dashboard.vercel.app)

## Links

| Resource               | Link                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Hosted Application** | [https://epiroc-vehicle-dashboard.vercel.app](https://epiroc-vehicle-dashboard.vercel.app)                         |
| **GitHub Repository**  | [https://github.com/Ajinkyajoe/epiroc-vehicle-dashboard.](https://github.com/Ajinkyajoe/epiroc-vehicle-dashboard.) |

---

## Overview

Full-stack vehicle dashboard built for the Epiroc FVT Full-Stack Developer Challenge. The application displays real-time vehicle telemetry data from a cloud database and allows user interactions to modify backend values. The backend automatically emulates real-time changes to motor RPM, battery levels, and temperature.

## Tech Stack

- **Frontend**: React 18, Chart.js, TailwindCSS, Axios, Lucide React icons
- **Backend**: Node.js, Express, Mongoose, node-cron
- **Database**: MongoDB Atlas

---

## Local Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/epiroc-vehicle-dashboard.git
cd epiroc-vehicle-dashboard
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Start the Backend

```bash
npm start
```

The server will run on `http://localhost:5000`.

### 4. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 5. Start the Frontend

```bash
npm start
```

The application will open at `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint       | Description                       |
| ------ | -------------- | --------------------------------- |
| GET    | `/`            | API info                          |
| GET    | `/api/vehicle` | Fetch all vehicle data            |
| POST   | `/api/vehicle` | Update vehicle fields             |
| GET    | `/health`      | Check backend and database status |

---

## Features

### User Interface

- Real-time gauges for power output and motor RPM
- Status indicators for parking brake, check engine, motor status, and battery low
- Telemetry displays: gear ratio, battery percentage, battery temperature, motor RPM
- Interactive motor speed slider (0–100)
- Charging toggle button

### Backend & Database

- All values stored in MongoDB Atlas and fetched on every request
- Real-time data emulation (motor RPM, battery levels, temperature) via cron job
- REST APIs for retrieving and updating values
- Fallback to in-memory storage if MongoDB is unavailable

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
