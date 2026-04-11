const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Register a new user
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'staff',
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            data: {
                user: user.toSafeJSON(),
                token,
            },
            message: 'User registered successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Login user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            data: {
                user: user.toSafeJSON(),
                token,
            },
            message: 'Login successful',
        });
    } catch (error) {
        next(error);
    }
};

// Get current user profile
const getProfile = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: req.user,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getProfile };
