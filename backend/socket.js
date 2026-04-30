const socketIo = require('socket.io');

let io;

const init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`New socket connection: ${socket.id}`);

        socket.on('join_room', (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`User ${userId} joined their notification room`);
            }
        });

        socket.on('join_race_chat', (raceId) => {
            if (raceId) {
                socket.join(`race_${raceId}`);
                console.log(`Socket ${socket.id} joined race context: ${raceId}`);
            }
        });

        socket.on('join_live_hud', (raceId) => {
            if (raceId) {
                socket.join(`race_${raceId}`);
                console.log(`Socket ${socket.id} established HUD link for race: ${raceId}`);
            }
        });

        socket.on('join_admin_feed', () => {
            socket.join('admin_war_room');
            console.log(`Administrator ${socket.id} joined global command feed`);
        });

        socket.on('leave_race_chat', (raceId) => {
            if (raceId) {
                socket.leave(`race_${raceId}`);
                console.log(`Socket ${socket.id} left race chat: ${raceId}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { init, getIO };
