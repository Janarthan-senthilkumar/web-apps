require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const responseRoutes = require('./routes/responses');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date().toISOString() }));

// Socket.io
io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    socket.on('joinRoom', (complaintId) => {
        socket.join(`complaint_${complaintId}`);
    });

    socket.on('disconnect', () => {
        console.log(`✂ Socket disconnected: ${socket.id}`);
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        server.listen(process.env.PORT || 5000, () => {
            console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
