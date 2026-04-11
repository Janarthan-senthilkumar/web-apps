const express = require('express');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/staff/complaints — assigned to this staff member
router.get('/complaints', protect, authorize('staff'), async (req, res) => {
    try {
        const { status, search } = req.query;
        const query = { assignedTo: req.user._id };
        if (status) query.status = status;
        if (search) query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
        const complaints = await Complaint.find(query)
            .populate('submittedBy', 'name email department')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/staff/stats
router.get('/stats', protect, authorize('staff'), async (req, res) => {
    try {
        const total = await Complaint.countDocuments({ assignedTo: req.user._id });
        const pending = await Complaint.countDocuments({ assignedTo: req.user._id, status: 'Pending' });
        const inProgress = await Complaint.countDocuments({ assignedTo: req.user._id, status: 'In Progress' });
        const resolved = await Complaint.countDocuments({ assignedTo: req.user._id, status: 'Resolved' });
        res.json({ total, pending, inProgress, resolved });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/staff/complaints/:id — update status, add notes
router.put('/complaints/:id', protect, authorize('staff'), async (req, res) => {
    try {
        const { status, notes } = req.body;
        const complaint = await Complaint.findOne({ _id: req.params.id, assignedTo: req.user._id });
        if (!complaint) return res.status(404).json({ message: 'Complaint not found or not assigned to you' });

        if (status) {
            complaint.status = status;
            if (status === 'Resolved' || status === 'Closed') complaint.resolvedAt = new Date();
        }
        if (notes !== undefined) complaint.notes = notes;
        await complaint.save();

        // Notify submitter
        await Notification.create({
            user: complaint.submittedBy,
            message: `Your complaint "${complaint.title}" status updated to ${complaint.status}`,
            type: 'status',
            relatedComplaint: complaint._id
        });

        if (req.app.get('io')) {
            req.app.get('io').emit('complaintUpdated', complaint);
        }

        const populated = await complaint.populate([
            { path: 'submittedBy', select: 'name email department' },
            { path: 'assignedTo', select: 'name email' }
        ]);
        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
