const AuditLog = require('../models/AuditLog');

// Create audit log entry
const createAuditLog = async ({ action, entity, entityId, user, description, changes, req }) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId,
      user: user || (req && req.user ? req.user._id : null),
      description,
      changes,
      ipAddress: req ? req.ip || req.connection.remoteAddress : null,
      userAgent: req ? req.headers['user-agent'] : null,
    });
  } catch (error) {
    console.error('Audit log creation failed:', error.message);
  }
};

// Generate unique reference numbers
const generateRefNumber = (prefix = 'TXN') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Pagination helper
const getPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const sort = query.sort || '-createdAt';
  return { page, limit, skip, sort };
};

// Build filter query from request
const buildFilterQuery = (query, allowedFields = []) => {
  const filter = {};
  allowedFields.forEach((field) => {
    if (query[field] !== undefined && query[field] !== '') {
      filter[field] = query[field];
    }
  });
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { sku: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }
  return filter;
};

module.exports = { createAuditLog, generateRefNumber, getPagination, buildFilterQuery };
