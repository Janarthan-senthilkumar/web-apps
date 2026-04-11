const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const total = await Complaint.countDocuments();
        const pending = await Complaint.countDocuments({ status: 'Pending' });
        const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
        const resolved = await Complaint.countDocuments({ status: 'Resolved' });
        const closed = await Complaint.countDocuments({ status: 'Closed' });
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalStaff = await User.countDocuments({ role: 'staff' });

        // By category
        const byCategory = await Complaint.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // By priority
        const byPriority = await Complaint.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        // Recent 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentByDay = await Complaint.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({ total, pending, inProgress, resolved, closed, totalUsers, totalStaff, byCategory, byPriority, recentByDay });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/complaints
router.get('/complaints', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, category, priority, search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (search) query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];

        const total = await Complaint.countDocuments(query);
        const complaints = await Complaint.find(query)
            .populate('submittedBy', 'name email department')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({ complaints, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/complaints/:id/assign
router.put('/complaints/:id/assign', protect, authorize('admin'), async (req, res) => {
    try {
        const { staffId } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { assignedTo: staffId || null, status: staffId ? 'In Progress' : 'Pending' },
            { new: true }
        ).populate('submittedBy', 'name email').populate('assignedTo', 'name email');

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Notify the assigned staff
        if (staffId) {
            await Notification.create({
                user: staffId,
                message: `You have been assigned complaint: "${complaint.title}"`,
                type: 'assignment',
                relatedComplaint: complaint._id
            });
        }

        // Notify the submitter
        await Notification.create({
            user: complaint.submittedBy._id,
            message: `Your complaint "${complaint.title}" is now In Progress`,
            type: 'status',
            relatedComplaint: complaint._id
        });

        if (req.app.get('io')) {
            req.app.get('io').emit('complaintUpdated', complaint);
        }

        res.json(complaint);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/complaints/:id/status
router.put('/complaints/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, notes } = req.body;
        const update = { status };
        if (notes) update.notes = notes;
        if (status === 'Resolved' || status === 'Closed') update.resolvedAt = new Date();

        const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
            .populate('submittedBy', 'name email').populate('assignedTo', 'name email');

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        await Notification.create({
            user: complaint.submittedBy._id,
            message: `Your complaint "${complaint.title}" status changed to ${status}`,
            type: 'status', relatedComplaint: complaint._id
        });

        if (req.app.get('io')) {
            req.app.get('io').emit('complaintUpdated', complaint);
        }

        res.json(complaint);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/users
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const { role, search } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/users/:id
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, role, department, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id, { name, role, department, isActive }, { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
