const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// ─── Multer setup ──────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX, JPG, PNG files are allowed'));
  },
});

// Wraps multer so its errors are returned as JSON instead of crashing Express
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

const generateHash = (data) =>
  crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

const generateDocumentId = () =>
  'DOC-' + uuidv4().toUpperCase().replace(/-/g, '').substring(0, 12);

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

const normalizeString = (value) => String(value ?? '').trim();

const normalizeDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const normalizeMetadata = (metadata) => {
  if (!metadata) return {};
  const source = metadata instanceof Map ? Object.fromEntries(metadata.entries()) : metadata;
  return Object.keys(source).sort().reduce((acc, key) => {
    acc[key] = String(source[key] ?? '');
    return acc;
  }, {});
};

const parseMetadataInput = (metadata) => {
  if (metadata === undefined || metadata === null || metadata === '') return undefined;
  if (metadata instanceof Map) return metadata;
  if (typeof metadata === 'object') return metadata;
  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch (_) {
      return undefined;
    }
  }
  return undefined;
};

const getFilePathFromUrl = (fileUrl) => {
  if (!fileUrl) return '';
  const relativePath = String(fileUrl).replace(/^\/+/, '');
  return path.join(__dirname, '..', relativePath);
};

const calculateFileHashFromPath = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return '';
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

const calculateDocumentFileHash = (document) => {
  if (!document?.fileUrl) return '';
  return calculateFileHashFromPath(getFilePathFromUrl(document.fileUrl));
};

const buildContentPayload = (document, fileHash) => ({
  documentId: normalizeString(document.documentId),
  title: normalizeString(document.title),
  documentType: normalizeString(document.documentType),
  issuerName: normalizeString(document.issuerName),
  issuerOrganization: normalizeString(document.issuerOrganization),
  holderName: normalizeString(document.holderName),
  holderEmail: normalizeString(document.holderEmail).toLowerCase(),
  description: normalizeString(document.description),
  issueDate: normalizeDate(document.issueDate),
  expiryDate: normalizeDate(document.expiryDate),
  metadata: normalizeMetadata(document.metadata),
  fileName: normalizeString(document.fileName),
  fileType: normalizeString(document.fileType),
  fileHash: normalizeString(fileHash),
});

const calculateContentHash = (document, fileHash = '') =>
  generateHash(buildContentPayload(document, fileHash));

const calculateBlockHash = ({ contentHash, blockIndex, previousHash }) =>
  generateHash({
    contentHash: normalizeString(contentHash),
    blockIndex: Number(blockIndex),
    previousHash: normalizeString(previousHash),
  });

const getExpectedPreviousHash = async (blockIndex) => {
  if (blockIndex <= 1) return GENESIS_HASH;
  const previousBlock = await Document.findOne({ blockIndex: blockIndex - 1 }).select('verificationHash');
  return previousBlock?.verificationHash || null;
};

const verifyDocumentIntegrity = async (document) => {
  if (document.isTampered) {
    return {
      isValid: false,
      reason: document.tamperReason || 'Document was edited after registration',
    };
  }

  // Legacy records (before deterministic content hashing) are treated as valid.
  if (!document.contentHash) {
    return { isValid: true, isLegacy: true };
  }

  const expectedPreviousHash = await getExpectedPreviousHash(document.blockIndex);
  if (!expectedPreviousHash) {
    return { isValid: false, reason: 'Missing previous block in chain' };
  }

  const fileHash = calculateDocumentFileHash(document);
  const expectedContentHash = calculateContentHash(document, fileHash);
  const expectedVerificationHash = calculateBlockHash({
    contentHash: expectedContentHash,
    blockIndex: document.blockIndex,
    previousHash: expectedPreviousHash,
  });

  const matchesChainLink = document.previousHash === expectedPreviousHash;
  const matchesContent = document.contentHash === expectedContentHash;
  const matchesBlockHash = document.verificationHash === expectedVerificationHash;

  if (matchesChainLink && matchesContent && matchesBlockHash) {
    return {
      isValid: true,
      expectedPreviousHash,
      expectedContentHash,
      expectedVerificationHash,
    };
  }

  const reasons = [];
  if (!matchesChainLink) reasons.push('Chain link mismatch');
  if (!matchesContent) reasons.push('Content hash mismatch');
  if (!matchesBlockHash) reasons.push('Block hash mismatch');

  return {
    isValid: false,
    reason: reasons.join('. '),
    expectedPreviousHash,
    expectedContentHash,
    expectedVerificationHash,
  };
};

const markDocumentTampered = async (document, reason) => {
  const cleanReason = normalizeString(reason) || 'Integrity check failed';

  document.isTampered = true;
  if (!document.tamperedAt) document.tamperedAt = new Date();
  if (!document.tamperReason) document.tamperReason = cleanReason;
  if (document.status === 'Active') document.status = 'Revoked';

  await document.save();
};

const rebuildChain = async () => {
  const documents = await Document.find().sort({ blockIndex: 1, createdAt: 1, _id: 1 });
  let previousHash = GENESIS_HASH;

  for (let i = 0; i < documents.length; i += 1) {
    const doc = documents[i];
    const nextBlockIndex = i + 1;
    const contentHash = doc.contentHash || calculateContentHash(doc, calculateDocumentFileHash(doc));
    const verificationHash = calculateBlockHash({
      contentHash,
      blockIndex: nextBlockIndex,
      previousHash,
    });

    const changed =
      doc.blockIndex !== nextBlockIndex ||
      doc.previousHash !== previousHash ||
      doc.verificationHash !== verificationHash;

    if (changed) {
      doc.blockIndex = nextBlockIndex;
      doc.previousHash = previousHash;
      doc.verificationHash = verificationHash;
      await doc.save();
    }

    previousHash = verificationHash;
  }
};

// ─── GET all documents ─────────────────────────────────────────────────────────
// Admin: all docs. User: own docs only.
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, documentType, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.uploadedBy = req.user._id;
    }
    if (status) filter.status = status;
    if (documentType) filter.documentType = documentType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { holderName: { $regex: search, $options: 'i' } },
        { issuerOrganization: { $regex: search, $options: 'i' } },
        { documentId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Document.countDocuments(filter);
    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: documents,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET single document ───────────────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    if (req.user.role !== 'admin' && document.uploadedBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST create document ──────────────────────────────────────────────────────
// Any authenticated user. Status defaults to Pending.
router.post('/', verifyToken, handleUpload, async (req, res) => {
  try {
    const {
      title, documentType, issuerName, issuerOrganization,
      holderName, holderEmail, description, issueDate, expiryDate, metadata,
    } = req.body;
    const parsedMetadata = parseMetadataInput(metadata);

    const lastDoc = await Document.findOne().sort({ blockIndex: -1 });
    const blockIndex = lastDoc ? lastDoc.blockIndex + 1 : 1;
    const previousHash = lastDoc
      ? lastDoc.verificationHash
      : GENESIS_HASH;

    const documentId = generateDocumentId();
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const fileHash = req.file ? calculateFileHashFromPath(getFilePathFromUrl(fileUrl)) : '';
    const contentHash = calculateContentHash({
      documentId, title, documentType, issuerName, issuerOrganization,
      holderName, holderEmail,
      description: description || '',
      issueDate,
      expiryDate: expiryDate || undefined,
      metadata: parsedMetadata || {},
      fileName: req.file?.originalname || '',
      fileType: req.file?.mimetype || '',
    }, fileHash);
    const verificationHash = calculateBlockHash({ contentHash, blockIndex, previousHash });

    const document = new Document({
      title, documentType, issuerName, issuerOrganization,
      holderName, holderEmail,
      description: description || '',
      issueDate,
      expiryDate: expiryDate || undefined,   // empty string → skip (Date cast error)
      metadata: parsedMetadata,
      contentHash,
      fileHash,
      documentId, verificationHash, previousHash, blockIndex,
      status: 'Pending',
      uploadedBy: req.user._id,
      uploadedByName: req.user.name,
      uploadedByEmail: req.user.email,
      ...(req.file && {
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
      }),
    });

    const saved = await document.save();
    res.status(201).json({ success: true, data: saved, message: 'Document submitted for verification' });
  } catch (error) {
    console.error('[POST /documents] Error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Document with this ID already exists' });
    }
    // Mongoose cast/validation errors → readable 400 instead of 500
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT update document ────────────────────────────────────────────────────────
// Admin: update any field. User: can only update their own pending docs (no status change).
router.put('/:id', verifyToken, handleUpload, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = document.uploadedBy?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!isAdmin && document.status !== 'Pending') {
      return res.status(403).json({ success: false, message: 'Only pending documents can be edited' });
    }

    const { title, documentType, issuerName, issuerOrganization, holderName, holderEmail,
      description, issueDate, expiryDate, status, metadata } = req.body;
    const parsedMetadata = parseMetadataInput(metadata);
    const previousFileHash = calculateDocumentFileHash(document);
    const previousContentHash = calculateContentHash(document, previousFileHash);

    if (title) document.title = title;
    if (documentType) document.documentType = documentType;
    if (issuerName) document.issuerName = issuerName;
    if (issuerOrganization) document.issuerOrganization = issuerOrganization;
    if (holderName) document.holderName = holderName;
    if (holderEmail) document.holderEmail = holderEmail;
    if (description !== undefined) document.description = description;
    if (issueDate) document.issueDate = issueDate;
    // empty string → null clears the field; truthy string → update
    if (expiryDate !== undefined) document.expiryDate = expiryDate || null;
    if (isAdmin && status) document.status = status;
    if (metadata !== undefined) document.metadata = parsedMetadata || {};

    if (req.file) {
      // Delete old file from disk if it exists
      if (document.fileUrl) {
        const oldPath = getFilePathFromUrl(document.fileUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      document.fileUrl = `/uploads/${req.file.filename}`;
      document.fileName = req.file.originalname;
      document.fileSize = req.file.size;
      document.fileType = req.file.mimetype;
    }

    const nextFileHash = calculateDocumentFileHash(document);
    const nextContentHash = calculateContentHash(document, nextFileHash);
    const contentWasEdited = previousContentHash !== nextContentHash;

    if (contentWasEdited) {
      await markDocumentTampered(
        document,
        `Document content edited by ${req.user.email || req.user.name || 'authorized user'}`
      );
    } else {
      await document.save();
    }

    const updated = await Document.findById(document._id);
    res.json({
      success: true,
      data: updated,
      tampered: Boolean(updated?.isTampered),
      message: contentWasEdited
        ? 'Document updated. Integrity alert recorded: this document is now flagged as tampered.'
        : 'Document updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT review document (admin only) ─────────────────────────────────────────
// Approve → Active, Reject → Revoked
router.put('/:id/review', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { action, note } = req.body; // action: 'approve' | 'reject'
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    document.status = action === 'approve' ? 'Active' : 'Revoked';
    document.verifiedBy = req.user.name;
    document.verificationNote = note || '';
    document.reviewedAt = new Date();

    const updated = await document.save();
    res.json({ success: true, data: updated, message: action === 'approve' ? 'Document approved' : 'Document rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE document (admin only) ──────────────────────────────────────────────
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    if (document.fileUrl) {
      const filePath = getFilePathFromUrl(document.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await rebuildChain();
    res.json({ success: true, message: 'Document deleted successfully', data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST verify by hash (public) ─────────────────────────────────────────────
router.post('/verify/hash', async (req, res) => {
  try {
    const { verificationHash } = req.body;
    if (!verificationHash) return res.status(400).json({ success: false, message: 'Verification hash is required' });

    const document = await Document.findOne({ verificationHash });
    if (!document) {
      return res.json({ success: true, verified: false, message: 'Document not found. This hash does not match any registered document.' });
    }

    const integrity = await verifyDocumentIntegrity(document);
    if (!integrity.isValid) {
      await markDocumentTampered(document, integrity.reason || 'Integrity check failed during hash verification');
      return res.json({
        success: true,
        verified: false,
        tampered: true,
        message: 'Tampering detected. This document no longer matches its registered blockchain fingerprint.',
        reason: integrity.reason || document.tamperReason || 'Integrity check failed',
        data: document,
      });
    }

    document.verificationCount += 1;
    document.lastVerified = new Date();
    await document.save();
    res.json({ success: true, verified: true, message: 'Document verified successfully! This is an authentic document.', data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST verify by ID (public) ───────────────────────────────────────────────
router.post('/verify/id', async (req, res) => {
  try {
    const { documentId } = req.body;
    if (!documentId) return res.status(400).json({ success: false, message: 'Document ID is required' });

    const document = await Document.findOne({ documentId });
    if (!document) {
      return res.json({ success: true, verified: false, message: 'Document not found. This ID does not match any registered document.' });
    }

    const integrity = await verifyDocumentIntegrity(document);
    if (!integrity.isValid) {
      await markDocumentTampered(document, integrity.reason || 'Integrity check failed during ID verification');
      return res.json({
        success: true,
        verified: false,
        tampered: true,
        message: 'Tampering detected. This document no longer matches its registered blockchain fingerprint.',
        reason: integrity.reason || document.tamperReason || 'Integrity check failed',
        data: document,
      });
    }

    document.verificationCount += 1;
    document.lastVerified = new Date();
    await document.save();
    res.json({ success: true, verified: true, message: 'Document verified successfully! This is an authentic document.', data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET stats/overview ────────────────────────────────────────────────────────
// Admin: system-wide. User: own documents.
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    const base = req.user.role !== 'admin' ? { uploadedBy: req.user._id } : {};

    const [total, active, revoked, expired, pending, byType, totalVerifArr] = await Promise.all([
      Document.countDocuments(base),
      Document.countDocuments({ ...base, status: 'Active' }),
      Document.countDocuments({ ...base, status: 'Revoked' }),
      Document.countDocuments({ ...base, status: 'Expired' }),
      Document.countDocuments({ ...base, status: 'Pending' }),
      Document.aggregate([
        { $match: base },
        { $group: { _id: '$documentType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Document.aggregate([
        { $match: base },
        { $group: { _id: null, total: { $sum: '$verificationCount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: { total, active, revoked, expired, pending, byType, totalVerifications: totalVerifArr[0]?.total || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
