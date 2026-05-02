const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Blockchain Document Verification API is running',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blockchain_docs';

const seedDemoAccounts = async () => {
  const User = require('./models/User');
  const demos = [
    { name: 'Admin Demo', email: 'admin@blockverify.com', password: 'admin123', role: 'admin', organization: 'BlockVerify HQ' },
    { name: 'User Demo',  email: 'user@blockverify.com',  password: 'user123',  role: 'user',  organization: 'Demo Organization' },
  ];
  for (const demo of demos) {
    const exists = await User.findOne({ email: demo.email });
    if (!exists) {
      await User.create(demo);
      console.log(`🌱 Demo account created: ${demo.email} (${demo.role})`);
    }
  }
};

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    await seedDemoAccounts();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
