const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/notifications — get all for current user
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .populate('relatedComplaint', 'title status')
            .sort({ createdAt: -1 })
            .limit(30);
        const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
    try {
        await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
        res.json({ message: 'Marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
