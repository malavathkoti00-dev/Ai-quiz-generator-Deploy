const jwt = require('jsonwebtoken');
const User = require('../models/User');

const rooms = new Map(); // RoomId -> { players: [], quiz: null, started: false }

const socketHandler = (io) => {
    // Middleware for Socket Auth
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("Authentication error"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('username');
            
            if (!user) return next(new Error("User not found"));
            
            socket.user = user;
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.username}`);

        socket.on('join_room', ({ roomId }) => {
            if (!roomId) return;

            socket.join(roomId);

            if (!rooms.has(roomId)) {
                rooms.set(roomId, { players: [], quiz: null, started: false });
            }

            const room = rooms.get(roomId);
            
            // Avoid duplicate players
            if (!room.players.find(p => p.id === socket.user._id.toString())) {
                room.players.push({
                    id: socket.user._id,
                    username: socket.user.username,
                    score: 0,
                    socketId: socket.id
                });
            }

            io.to(roomId).emit('room_update', room);
            console.log(`${socket.user.username} joined room: ${roomId}`);
        });

        socket.on('start_game', ({ roomId, quiz }) => {
            const room = rooms.get(roomId);
            if (room) {
                room.started = true;
                room.quiz = quiz;
                io.to(roomId).emit('game_started', { quiz });
            }
        });

        socket.on('submit_answer', ({ roomId, isCorrect }) => {
            const room = rooms.get(roomId);
            if (room) {
                const player = room.players.find(p => p.socketId === socket.id);
                if (player && isCorrect) {
                    player.score += 10;
                }
                io.to(roomId).emit('room_update', room);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.username}`);
            // Cleanup rooms
            rooms.forEach((room, roomId) => {
                const index = room.players.findIndex(p => p.socketId === socket.id);
                if (index !== -1) {
                    room.players.splice(index, 1);
                    if (room.players.length === 0) {
                        rooms.delete(roomId);
                    } else {
                        io.to(roomId).emit('room_update', room);
                    }
                }
            });
        });
    });
};

module.exports = socketHandler;
