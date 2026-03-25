# Circuit Quantum Framework 🌌
**Elite Full-Stack Racing Event Management Platform**

Circuit Quantum is a premium, tactical racing platform designed for high-stakes coordination and real-Time event management. Built for **Operatives**, **Partners**, and **Admins**.

---

## 🚀 Premium Features

### 🎮 The Operative Experience (Gamification)
- **Live XP & Leveling**: Gain experience by joining races, winning engagements, and coordinating in comms.
- **Faction System**: Join elite teams like **Cyber Shadows** or **Neon Pulse**.
- **Daily Recon Missions**: Dynamic daily challenges with unique XP rewards.
- **Mission Certificates**: Shareable digital badges for every completed deployment.

### 📡 Tactical HUD & Telemetry
- **Operative HUD (Header)**: Real-time tracking of XP, Level, and Mission Status.
- **Latency Telemetry (Ping)**: Built-in performance monitoring for API interactions.
- **Matrix Breach Detection**: Advanced tactical error boundaries for system resilience.
- **Comms Channel**: Real-time Socket.io bridge for team coordination.

### 🗺 Territory Map System
- **Sector Filtering**: Sort tactical engagements by **Sector**, **Race Type**, and **Distance**.
- **Tactical Map**: Leaflet-based territory visualization with faction-themed markers.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Animation**: Framer Motion (Fluid UI transitions)
- **Real-Time**: Socket.io-client
- **Maps**: React Leaflet
- **Performance**: Custom Telemetry Instrumentation

### Backend
- **Server**: Node.js & Express
- **Database**: MongoDB (Mongoose)
- **Real-Time**: Socket.io
- **Security**: JWT Authentication & Role-based Access

---

## 📦 Installation & Deployment

### 1. Clone the Matrix
```bash
git clone https://github.com/Usman572/tactical-race-framework.git
cd tactical-race-framework
```

### 2. Initialize Core Systems
The framework is a monorepo. Install dependencies for both the frontend and backend:
```bash
# Install root orchestration
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Configure Environment
Create a `.env` file in the `backend` folder with:
```env
PORT=5005
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Initiate Deployment (Local)
Run the root command to start both the Frontend Matrix and Backend Reactor:
```bash
npm run dev
```

---

## 🔑 Operative Credentials

| Role | Email Format | Access Level |
| :--- | :--- | :--- |
| **Admin** | `admin@race.com` | High-level oversignt & platform control. |
| **Partner** | `partner@race.com` | Event creation and sector management. |
| **Racer** | Any other email | Engagement participation & XP tracking. |

---

## 📝 Performance Notes

The application uses **Quantum Telemetry** to track API latency. Look for the **Ping** indicator in the top-right HUD to monitor your connection to the Matrix.

> [!IMPORTANT]
> This framework is designed for elite performance. The grid is active. Deployment is green.
