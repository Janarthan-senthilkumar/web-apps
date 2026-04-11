const express = require('express');
const Complaint = require('../models/Complaint');
const Response = require('../models/Response');
const Notification = require('../models/Notification');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// POST /api/complaints — submit complaint (user)
router.post('/', protect, authorize('user'), upload.array('attachments', 3), async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;
        const attachments = (req.files || []).map(f => ({
            filename: f.filename, originalName: f.originalname, mimetype: f.mimetype, size: f.size
        }));
        const complaint = await Complaint.create({
            title, description, category, priority, attachments,
            submittedBy: req.user._id, department: req.user.department
        });

        // Notify admins
        const User = require('../models/User');
        const admins = await User.find({ role: 'admin' });
        const notifications = admins.map(a => ({
            user: a._id, message: `New complaint submitted: "${title}"`,
            type: 'complaint', relatedComplaint: complaint._id
        }));
        await Notification.insertMany(notifications);

        // Emit socket event if io is available
        if (req.app.get('io')) {
            req.app.get('io').emit('newComplaint', complaint);
        }

        const populated = await complaint.populate('submittedBy', 'name email');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/complaints/my — user's own complaints
router.get('/my', protect, authorize('user'), async (req, res) => {
    try {
        const complaints = await Complaint.find({ submittedBy: req.user._id })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/complaints/:id — get single complaint
router.get('/:id', protect, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('submittedBy', 'name email department')
            .populate('assignedTo', 'name email');
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Users can only see their own
        if (req.user.role === 'user' && complaint.submittedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
