const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['Academic', 'Infrastructure', 'Administrative', 'Hostel', 'Library', 'Transport', 'Other'],
        default: 'Other'
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Closed'], default: 'Pending' },
    attachments: [{ filename: String, originalName: String, mimetype: String, size: Number }],
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    department: { type: String, default: '' },
    notes: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
