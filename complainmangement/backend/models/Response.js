const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isInternal: { type: Boolean, default: false }, // internal staff notes vs user-visible
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);
