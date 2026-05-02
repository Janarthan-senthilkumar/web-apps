const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, organization: u.organization });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, organization } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = new User({ name, email, password, role: role || 'user', organization: organization || '' });
    await user.save();
    res.status(201).json({ success: true, token: signToken(user._id), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    res.json({ success: true, token: signToken(user._id), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  res.json({ success: true, user: safeUser(req.user) });
});

// GET /api/auth/users  (admin only)
router.get('/users', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/auth/users/:id  (admin only)
router.delete('/users/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
