const jwt = require('jsonwebtoken');
const User = require('../models/User');

const rooms = new Map(); // RoomId -> { players: [], quiz: null, started: false }
const roomCleanupTimeouts = new Map(); // RoomId -> Timeout

// Helper to remove a player from a room and schedule cleanup if empty
const removePlayerFromRoom = (socket, roomId, io) => {
    if (!roomId) return;
    roomId = roomId.trim().toUpperCase();
    
    if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        const index = room.players.findIndex(p => p.id.toString() === socket.user._id.toString() || p.socketId === socket.id);
        
        if (index !== -1) {
            const player = room.players[index];
            room.players.splice(index, 1);
            console.log(`[removePlayer] Removed ${player.username} from room ${roomId}. Remaining players: ${room.players.length}`);
            
            io.to(roomId).emit('room_update', room);
            
            // If room is empty, schedule cleanup in 2 minutes
            if (room.players.length === 0) {
                if (roomCleanupTimeouts.has(roomId)) {
                    clearTimeout(roomCleanupTimeouts.get(roomId));
                }
                
                console.log(`[removePlayer] Room ${roomId} is empty. Scheduling deletion in 2 minutes.`);
                const timeout = setTimeout(() => {
                    if (rooms.has(roomId)) {
                        const currentRoom = rooms.get(roomId);
                        if (currentRoom.players.length === 0) {
                            rooms.delete(roomId);
                            roomCleanupTimeouts.delete(roomId);
                            console.log(`[cleanup] Room ${roomId} deleted due to inactivity.`);
                        }
                    }
                }, 2 * 60 * 1000); // 2 minutes grace period
                
                roomCleanupTimeouts.set(roomId, timeout);
            }
        }
    }
};

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

        socket.on('join_room', ({ roomId, isHost }) => {
            if (!roomId) return;
            
            // Trim whitespace and uppercase to prevent mismatches
            roomId = roomId.trim().toUpperCase();
            
            console.log(`[join_room] User: ${socket.user.username}, Room: ${roomId}, isHost: ${isHost}`);
            console.log(`[join_room] Active rooms: ${[...rooms.keys()].join(', ') || 'none'}`);

            // Clear any pending cleanup timeout for this room as a user is joining/rejoining
            if (roomCleanupTimeouts.has(roomId)) {
                clearTimeout(roomCleanupTimeouts.get(roomId));
                roomCleanupTimeouts.delete(roomId);
                console.log(`[join_room] Cancelled cleanup timeout for room ${roomId} as a user joined/rejoined.`);
            }

            if (isHost) {
                if (!rooms.has(roomId)) {
                    rooms.set(roomId, { players: [], quiz: null, started: false });
                    console.log(`[join_room] Room ${roomId} CREATED by host ${socket.user.username}`);
                }
            } else {
                if (!rooms.has(roomId)) {
                    console.log(`[join_room] Room ${roomId} NOT FOUND for player ${socket.user.username}`);
                    return socket.emit('error', { message: 'Room not found. Please check the code.' });
                }
                if (rooms.get(roomId).started) {
                    return socket.emit('error', { message: 'Game has already started in this room.' });
                }
            }

            socket.join(roomId);
            const room = rooms.get(roomId);
            
            // Avoid duplicate players
            if (!room.players.find(p => p.id.toString() === socket.user._id.toString())) {
                room.players.push({
                    id: socket.user._id,
                    username: socket.user.username,
                    score: 0,
                    socketId: socket.id
                });
            } else {
                // Update socketId for reconnecting players
                const existingPlayer = room.players.find(p => p.id.toString() === socket.user._id.toString());
                if (existingPlayer) existingPlayer.socketId = socket.id;
            }

            io.to(roomId).emit('room_update', room);
            console.log(`[join_room] ${socket.user.username} joined room: ${roomId} as ${isHost ? 'Host' : 'Player'}. Players: ${room.players.map(p => p.username).join(', ')}`);
        });

        socket.on('start_game', ({ roomId, quiz }) => {
            if (!roomId) return;
            roomId = roomId.trim().toUpperCase();
            
            const room = rooms.get(roomId);
            if (room) {
                room.started = true;
                room.quiz = quiz;
                io.to(roomId).emit('game_started', { quiz });
            }
        });

        socket.on('submit_answer', ({ roomId, isCorrect }) => {
            if (!roomId) return;
            roomId = roomId.trim().toUpperCase();
            
            const room = rooms.get(roomId);
            if (room) {
                const player = room.players.find(p => p.socketId === socket.id);
                if (player && isCorrect) {
                    player.score += 10;
                }
                io.to(roomId).emit('room_update', room);
            }
        });

        socket.on('leave_room', ({ roomId }) => {
            if (!roomId) return;
            roomId = roomId.trim().toUpperCase();
            console.log(`User left room: ${socket.user.username}, Room: ${roomId}`);
            removePlayerFromRoom(socket, roomId, io);
            socket.leave(roomId);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.username}`);
            // Cleanup rooms player belongs to
            rooms.forEach((room, roomId) => {
                const isPlayerInRoom = room.players.some(p => p.id.toString() === socket.user._id.toString() || p.socketId === socket.id);
                if (isPlayerInRoom) {
                    removePlayerFromRoom(socket, roomId, io);
                }
            });
        });
    });
};

module.exports = socketHandler;
