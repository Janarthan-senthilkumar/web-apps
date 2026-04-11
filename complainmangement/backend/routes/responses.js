const express = require('express');
const Response = require('../models/Response');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/responses — add response to a complaint
router.post('/', protect, async (req, res) => {
    try {
        const { complaintId, message, isInternal } = req.body;
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Check permissions
        const role = req.user.role;
        if (role === 'user' && complaint.submittedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (role === 'staff' && (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Complaint not assigned to you' });
        }

        const response = await Response.create({
            complaint: complaintId, respondedBy: req.user._id, message,
            isInternal: isInternal && role !== 'user'
        });

        // Notify complaint owner (if responder is not the owner)
        if (complaint.submittedBy.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: complaint.submittedBy,
                message: `New response on your complaint: "${complaint.title}"`,
                type: 'response', relatedComplaint: complaint._id
            });
        }

        if (req.app.get('io')) {
            req.app.get('io').to(`complaint_${complaintId}`).emit('newResponse', response);
        }

        const populated = await response.populate('respondedBy', 'name email role');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/responses/:complaintId
router.get('/:complaintId', protect, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.complaintId);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        const query = { complaint: req.params.complaintId };
        if (req.user.role === 'user') query.isInternal = false; // hide internal notes

        const responses = await Response.find(query)
            .populate('respondedBy', 'name email role')
            .sort({ createdAt: 1 });
        res.json(responses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
