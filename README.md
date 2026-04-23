# Epiroc Vehicle Dashboard - Full Stack Challenge

[![Live Demo](https://img.shields.io/badge/Live-Vercel-black?style=for-the-badge&logo=vercel)](https://your-frontend-url.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-green?style=for-the-badge&logo=render)](https://your-backend-url.onrender.com)
[![Database](https://img.shields.io/badge/DB-MongoDB%20Atlas-blue?style=for-the-badge&logo=mongodb)](https://cloud.mongodb.com)

## Overview

Full-stack vehicle dashboard built for the Epiroc FVT Full-Stack Developer Challenge. Features real-time data display with interactive motor speed slider and charging toggle, backed by a cloud database with automatic data emulation.

## Tech Stack

- **Frontend**: React 18, Chart.js (gauges), TailwindCSS, Axios, Lucide React icons
- **Backend**: Node.js, Express, Mongoose, node-cron
- **Database**: MongoDB Atlas (M0 Free Tier)
- **Hosting**: Vercel (Frontend), Render (Backend)

---

## PART 1: GitHub Repository Setup

### Step 1.1 - Install GitHub CLI (if not already installed)

```powershell
# Download from: https://cli.github.com/
# Or use winget:
winget install GitHub.cli
```

### Step 1.2 - Login to GitHub

```powershell
gh auth login
# Follow prompts: HTTPS, Login with browser, paste code
```

### Step 1.3 - Create and Push Repository

```powershell
# Navigate to project root
cd /d "d:\epiroc\epiroc-vehicle-dashboard"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "feat: complete Epiroc vehicle dashboard challenge"

# Create public repository on GitHub
gh repo create epirc-vehicle-dashboard --public --source=. --remote=origin --push
```

### Step 1.4 - Verify Repository

Visit: `https://github.com/YOUR_USERNAME/epirc-vehicle-dashboard`

---

## PART 2: MongoDB Atlas Database Setup

### Step 2.1 - Create Account

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up (free, no credit card required)
3. Create new cluster → Select **M0 (Free Tier)**
4. Choose region closest to your backend (e.g., AWS / us-east-1)
5. Name cluster: `vehicle-dashboard-cluster`
6. Click **Create Cluster** (takes 1-3 minutes)

### Step 2.2 - Create Database User

1. Left sidebar → **Database Access**
2. Click **Add New Database User**
3. Authentication Method: **Password**
4. Username: `dashboard-user`
5. Password: Generate secure password, **COPY IT**
6. Built-in Role: **Read and write to any database**
7. Click **Add User**

### Step 2.3 - Network Access

1. Left sidebar → **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Confirm

### Step 2.4 - Get Connection String

1. Left sidebar → **Database** → Click **Connect** on your cluster
2. Choose **Drivers**
3. Select **Node.js** and version **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://dashboard-user:<password>@vehicle-dashboard-cluster.xxxxx.mongodb.net/dashboard?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the password from Step 2.2

### Step 2.5 - Update Backend Environment

Create/update `backend/.env`:

```
MONGODB_URI=mongodb+srv://dashboard-user:YOUR_PASSWORD@vehicle-dashboard-cluster.xxxxx.mongodb.net/dashboard?retryWrites=true&w=majority
PORT=5000
```

### Step 2.6 - Test Local with MongoDB

```powershell
cd backend
npm start
```

You should see: `✅ MongoDB connected` (instead of memory mode)

### Step 2.7 - Public Read-Only Database Link

1. In Atlas, go to **Database** → **Browse Collections**
2. Your database `dashboard` → collection `vehicledatas`
3. Atlas provides a built-in Data Explorer link
4. OR create a **Data API** endpoint for read-only access:
   - Atlas left sidebar → **Data API**
   - Enable Data API
   - Create read-only API key
   - Share the Data Explorer URL: `https://cloud.mongodb.com/v2/XXXXX#/metrics/replicaSet/XXXXX/explorer/dashboard/vehicledatas/find`

---

## PART 3: Deploy Backend to Render

### Step 3.1 - Sign Up

1. Go to [render.com](https://render.com)
2. Sign up with GitHub account

### Step 3.2 - Create Web Service

1. Dashboard → **New +** → **Web Service**
2. Connect your GitHub repository: `epirc-vehicle-dashboard`
3. Configure:
   - **Name**: `epirc-dashboard-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Click **Advanced**
   - Add Environment Variable:
     - Key: `MONGODB_URI`
     - Value: Your Atlas connection string from Part 2
5. Click **Create Web Service**

### Step 3.3 - Wait for Deploy

- Render builds and deploys (2-3 minutes)
- Copy the URL: `https://epirc-dashboard-api.onrender.com`

### Step 3.4 - Verify Backend

```powershell
Invoke-RestMethod -Uri https://epirc-dashboard-api.onrender.com/health
# Expected: {"status":"OK","mode":"mongodb"}
```

---

## PART 4: Deploy Frontend to Vercel (Static URL)

### Step 4.1 - Sign Up

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account

### Step 4.2 - Install Vercel CLI (optional but helpful)

```powershell
npm i -g vercel
```

### Step 4.3 - Deploy via Web UI

1. Vercel Dashboard → **Add New...** → **Project**
2. Import your GitHub repo: `epirc-vehicle-dashboard`
3. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
4. Click **Environment Variables**
   - Add: `REACT_APP_API_URL` = `https://epirc-dashboard-api.onrender.com/api`
5. Click **Deploy**

### Step 4.4 - Alternative: Deploy via CLI

```powershell
cd /d "d:\epiroc\epiroc-vehicle-dashboard\frontend"
vercel --prod
# Follow prompts, set REACT_APP_API_URL when asked
```

### Step 4.5 - Get Static URL

Vercel provides a URL like:

```
https://epirc-vehicle-dashboard.vercel.app
```

### Step 4.6 - Verify Full Stack

1. Open `https://epirc-vehicle-dashboard.vercel.app`
2. Confirm real-time data loads
3. Drag motor speed slider → RPM changes
4. Click charging button → battery charges instead of draining

---

## PART 5: Update README with Live Links

Edit `README.md` at the top of this file:

```markdown
[![Live Demo](https://img.shields.io/badge/Live-Vercel-black?style=for-the-badge&logo=vercel)](https://epirc-vehicle-dashboard.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-green?style=for-the-badge&logo=render)](https://epirc-dashboard-api.onrender.com)
[![Database](https://img.shields.io/badge/DB-MongoDB%20Atlas-blue?style=for-the-badge&logo=mongodb)](https://cloud.mongodb.com/v2/XXXXX)
```

Commit and push:

```powershell
git add README.md
git commit -m "docs: add live deployment links"
git push origin main
```

---

## Submission Checklist

| Requirement      | How to Provide                                             |
| ---------------- | ---------------------------------------------------------- |
| **Static URL**   | `https://epirc-vehicle-dashboard.vercel.app`               |
| **GitHub Repo**  | `https://github.com/YOUR_USERNAME/epirc-vehicle-dashboard` |
| **README**       | Already in repo (this file)                                |
| **Read-Only DB** | MongoDB Atlas Data Explorer link OR Data API URL           |

---

## Local Development (Without Cloud)

```powershell
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

Backend runs on `http://localhost:5000`
Frontend runs on `http://localhost:3000`

The app works in **memory mode** without MongoDB for local testing. Set `MONGODB_URI` in `backend/.env` to use Atlas locally.

---

## API Documentation

| Method | Endpoint       | Description                            |
| ------ | -------------- | -------------------------------------- |
| GET    | `/api/vehicle` | Fetch all vehicle data                 |
| POST   | `/api/vehicle` | Update fields `{ "fieldName": value }` |
| GET    | `/health`      | Check backend & database status        |

---

## Project Structure

```
epirc-vehicle-dashboard/
├── backend/
│   ├── server.js          # Express API + cron emulation
│   ├── package.json       # Node dependencies
│   └── .env               # MongoDB URI (not committed)
├── frontend/
│   ├── src/
│   │   ├── App.js         # Dashboard UI
│   │   ├── index.js       # React entry
│   │   └── index.css      # Tailwind styles
│   ├── public/
│   │   └── index.html
│   ├── package.json       # React dependencies
│   ├── tailwind.config.js
│   └── postcss.config.js
├── README.md              # This file
└── .gitignore             # Excludes node_modules, .env
```

---

## Troubleshooting

### CORS Error

Backend already has `app.use(cors())`. If issues persist, update `backend/server.js`:

```javascript
app.use(cors({ origin: "*" }));
```

### MongoDB Connection Fails

- Check IP whitelist (0.0.0.0/0)
- Verify password in connection string
- Ensure `dashboard` database name is in URI

### Frontend Shows "Loading Dashboard..."

- Check backend URL is correct in `REACT_APP_API_URL`
- Verify backend `/health` endpoint responds

### Slider Not Working

- Backend must be running (memory or MongoDB mode)
- Check browser DevTools Network tab for API errors

---

## License

Challenge submission for Epiroc FVT Inc. All rights reserved.
