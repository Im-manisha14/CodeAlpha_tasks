const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send('Project Management API is running...');
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-project', (projectId) => {
        socket.join(`project-${projectId}`);
        console.log(`User joined project-${projectId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Middleware to attach io to requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes placeholders
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
