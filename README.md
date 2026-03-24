# RaceApp - Racing Event Management Platform

RaceApp is a modern, responsive web application for managing and participating in racing events. It serves three distinct user roles: **Racers**, **Partners** (Event Organizers), and **Admins**.

The application features a premium, clean UI built with **React**, **Vite**, and **Tailwind CSS**.

---

## 🚀 Features

### 🏁 Public (Racers)
- **Browse Races**: View upcoming events in a clean, filterable table layout.
- **Race Details**: Click on any race to see full details (Location, Date, Type).
- **Registration**: Join races with a single click (simulated participation).
- **User Dashboard**: See your joined races and profile.

### 🤝 Partners (Organizers)
- **Create Races**: dedicated form to publish new events.
- **Manage Events**: Edit, delete, and track participants for your races.
- **Partner Dashboard**: View analytics on your active races and total user engagement.

### ⚡ Admin (Platform Managers)
- **Global Oversight**: Manage all users, partners, and races across the platform.
- **User Management**: View and manage all registered accounts.
- **Platform Analytics**: High-level stats on platform growth and activity.

---

## 🛠 Tech Stack

- **Frontend**: React.js (Vite)
- **Styling**: Tailwind CSS (Direct styling, no custom themes)
- **Routing**: React Router DOM (v6)
- **State Management**: React Context API (`AuthContext`, `RaceContext`)
- **Persistence**: `localStorage` (Simulates a backend database)
- **Icons**: React Icons / Emoji Badges

---

## 📦 Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd race-app
```

### 2. Install Dependencies
Ensure you have Node.js installed.
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Open in Browser
Visit `http://localhost:5173` (or the URL shown in your terminal).

---

## 🔑 Demo Credentials

Authenticatoin is simulated. You can use any email to register, or use these pre-defined flows:

### **Admin Access**
- **Email**: `admin@race.com` (or any email containing "admin")
- **Role**: Select **Admin** during signup/login.
- **Access**: Full platform control.

### **Partner Access**
- **Email**: `partner@race.com` (or any email containing "partner")
- **Role**: Select **Partner** during signup/login.
- **Access**: Create and manage own races.

### **Racer Access**
- **Email**: Any other email (e.g., `user@test.com`)
- **Role**: Select **Racer** during signup.
- **Access**: Join races and view public events.

---

## 🎨 Project Structure

- `src/layouts/`: Layout wrappers for Public, Partner, and Admin views.
- `src/pages/`: Individual page components (Home, Login, Dashboard, etc.).
- `src/context/`: Global state (Auth, Race data).
- `src/components/`: Reusable UI components.
- `index.css`: Global Tailwind directives and reset.

---

## 📝 Notes

- **Persistence**: Data (users, races) is saved to your browser's `Local Storage`. To reset the app, clear your browser data for the site.
- **Design**: The app uses a "Direct Styling" approach with Tailwind, eschewing complex theme variables for straightforward, maintainable utility classes.
