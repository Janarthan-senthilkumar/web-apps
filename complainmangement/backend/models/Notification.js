const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['complaint', 'response', 'status', 'assignment'], default: 'complaint' },
    relatedComplaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
