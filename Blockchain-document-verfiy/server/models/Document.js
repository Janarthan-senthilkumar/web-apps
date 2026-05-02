const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    documentId: { type: String, required: true, unique: true },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: ['Certificate', 'Identity', 'Medical', 'Legal', 'Academic', 'Financial', 'Government', 'Other'],
    },
    issuerName: { type: String, required: true, trim: true },
    issuerOrganization: { type: String, required: true, trim: true },
    holderName: { type: String, required: true, trim: true },
    holderEmail: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: [1000, 'Description cannot exceed 1000 characters'] },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    contentHash: { type: String, default: '' },
    fileHash: { type: String, default: '' },
    verificationHash: { type: String, required: true, unique: true },
    previousHash: {
      type: String,
      default: '0000000000000000000000000000000000000000000000000000000000000000',
    },
    blockIndex: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Revoked', 'Pending'],
      default: 'Pending',
    },
    metadata: { type: Map, of: String },
    verificationCount: { type: Number, default: 0 },
    lastVerified: { type: Date },
    isTampered: { type: Boolean, default: false },
    tamperedAt: { type: Date },
    tamperReason: { type: String, default: '' },
    // Uploader info
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedByName: { type: String, default: '' },
    uploadedByEmail: { type: String, default: '' },
    // Admin review
    verifiedBy: { type: String, default: '' },
    verificationNote: { type: String, default: '' },
    reviewedAt: { type: Date },
    // Uploaded file
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    fileType: { type: String, default: '' },
  },
  { timestamps: true }
);

documentSchema.index({ documentId: 1 });
documentSchema.index({ verificationHash: 1 });
documentSchema.index({ holderEmail: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Document', documentSchema);
