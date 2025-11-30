const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const initAdmin = require('./src/utils/initAdmin');
const migrateFeedbackIndexes = require('./src/utils/migrateFeedbackIndexes');
const migrateMenuTags = require('./src/utils/migrateMenuTags');
const migrateUsers = require('./src/utils/migrateUsers');
const migrateCarts = require('./src/utils/migrateCarts');
const migrateOrders = require('./src/utils/migrateOrders');
const migrateSupportChat = require('./src/utils/migrateSupportChat');

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set in environment variables. Using default secret (NOT SECURE FOR PRODUCTION)');
  process.env.JWT_SECRET = 'default_secret_key_change_in_production';
}

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Allow both transports
});

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/menu', require('./src/routes/menu'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/upload', require('./src/routes/upload'));
app.use('/api/feedback', require('./src/routes/feedback'));
app.use('/api/chatbot', require('./src/routes/chatbot'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/esewa', require('./src/routes/esewa'));
app.use('/api/khalti', require('./src/routes/khalti'));
app.use('/api/support', require('./src/routes/support'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join-admin-room', (adminId) => {
    socket.join(`admin-${adminId}`);
    socket.join('admins'); // All admins room
    console.log(`Admin ${adminId} joined admin room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize admin user
    await initAdmin();
    
    // Migrate user model (add new fields for Google OAuth and password reset)
    await migrateUsers();
    
    // Migrate carts (create cart documents for existing users)
    await migrateCarts();
    
    // Migrate orders (add eSewa fields and indexes)
    await migrateOrders();
    
    // Migrate feedback indexes (non-blocking - continues even if fails)
    try {
      await migrateFeedbackIndexes();
    } catch (error) {
      console.error('⚠️ Feedback migration warning (non-critical):', error.message);
    }
    
    // Migrate menu tags
    await migrateMenuTags();
    
    // Migrate support chat (create indexes) - non-blocking
    try {
      await migrateSupportChat();
    } catch (error) {
      console.error('⚠️ SupportChat migration warning (non-critical):', error.message);
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };

