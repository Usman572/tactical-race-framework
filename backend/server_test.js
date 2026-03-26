// server_test.js - Tailored for Automated Tactical Drills
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

// We don't connect to the real DB during simple unit tests, 
// but for integration drills, we use a separate test DB.
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/races', require('./routes/raceRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/missions', require('./routes/missionRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

app.get('/ping', (req, res) => {
    res.json({ status: 'backend alive' });
});

module.exports = app;
