const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const motherRoutes = require('./routes/mother');
const childRoutes = require('./routes/child');
const moodRoutes = require('./routes/mood');
const doctorRoutes = require('./routes/doctor');
const consultationroutes = require('./routes/consultation');
const chatroutes = require('./routes/neuroai');
const userRoutes = require('./routes/user');
const mythRealityRoutes = require('./routes/mythreality');
const messageRoutes = require('./routes/messages'); 

// Initialize app and server
const app = express();
const server = http.createServer(app); // 🔥 Replace app.listen with this

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080','https://neuronurture-pro.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'NeuroNurture API is running!' });
});
app.use('/api/auth', authRoutes);
app.use('/api/mother', motherRoutes);
app.use('/api/child', childRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/consultation', consultationroutes);
app.use('/api/neuroai', chatroutes);
app.use('/api/users', userRoutes);
app.use('/api/myths', mythRealityRoutes);
app.use('/api/messages',messageRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST']
  }
});


// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/neuronurture'}`);
  console.log('CORS enabled for:', ['http://localhost:3000', 'http://localhost:8080']);
});
