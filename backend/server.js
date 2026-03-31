// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

dotenv.config();
connectDB();

const app = express();

// --------------------
// Logging setup
// --------------------
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// --------------------
// Disable CORS restrictions
// --------------------
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));

// --------------------
// Body parsers
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --------------------
// Global Rate Limiting
// --------------------
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // Limit each IP to 150 requests per window
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply global limiter to all /api routes
app.use('/api', globalLimiter);

// Static Folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------
// Routes
// --------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/races', require('./routes/raceRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/partner', require('./routes/partnerRoutes'));
app.use('/api/missions', require('./routes/missionRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// --------------------
// Test route
// --------------------
app.get('/ping', (req, res) => {
    res.json({ status: 'backend alive' });
});

// --------------------
// Start server
// --------------------
const http = require('http');
const socketManager = require('./socket');
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
socketManager.init(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
