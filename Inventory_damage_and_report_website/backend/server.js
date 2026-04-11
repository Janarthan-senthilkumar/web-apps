require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const sequelize = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const damageRoutes = require('./routes/damageRoutes');
const replacementRoutes = require('./routes/replacementRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Import models to ensure associations are set up
const { User } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/damages', damageRoutes);
app.use('/api/replacements', replacementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Seed default users
const seedUsers = async () => {
    try {
        const userCount = await User.count();
        if (userCount === 0) {
            console.log('📝 Seeding default users...');

            await User.create({
                name: 'Staff User',
                email: 'staff@demo.com',
                password: 'staff123',
                role: 'staff',
            });

            await User.create({
                name: 'Supervisor User',
                email: 'supervisor@demo.com',
                password: 'super123',
                role: 'supervisor',
            });

            console.log('✅ Default users seeded:');
            console.log('   Staff: staff@demo.com / staff123');
            console.log('   Supervisor: supervisor@demo.com / super123');
        }
    } catch (error) {
        console.error('⚠️ Error seeding users:', error.message);
    }
};

// Initialize database and start server
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Sync database (alter: true to update schema with new columns)
        await sequelize.sync();
        console.log('✅ Database tables synchronized.');

        // Seed default users
        await seedUsers();

        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();
