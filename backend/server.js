// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config();
connectDB();

const app = express();

// --------------------
// Express 5 Compatibility
// --------------------
// Redefine request properties to be writable to allow sanitization middlewares
// to function correctly (Express 5 makes some of these read-only getters).
app.use((req, res, next) => {
    ['query', 'params', 'body'].forEach(prop => {
        Object.defineProperty(req, prop, {
            value: req[prop] ? { ...req[prop] } : (prop === 'body' ? {} : null),
            writable: true,
            configurable: true,
            enumerable: true,
        });
    });
    next();
});

// --------------------
// Security Middleware
// --------------------
// 1. Set secure HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Disable CORS restrictions
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));

// 3. Sanitize data against NoSQL injection
app.use(mongoSanitize());
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
app.use('/api/factions', require('./routes/factionRoutes'));
app.use('/api/missions', require('./routes/missionRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/factions', require('./routes/factionRoutes'));

// --------------------
// Test route
// --------------------
app.get('/ping', (req, res) => {
    res.json({ status: 'backend alive' });
});

// --------------------
// Error Handler
// --------------------
app.use((err, req, res, next) => {
    console.error('SERVER ERROR HANDLER:', err);
    res.status(err.status || 500).json({ 
        message: err.message || 'Server error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack 
    });
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

