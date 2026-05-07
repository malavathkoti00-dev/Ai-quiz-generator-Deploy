require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Socket Handler
require('./sockets/socketHandler')(io);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/attempts', require('./routes/attemptRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('AI Quiz Generator API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
