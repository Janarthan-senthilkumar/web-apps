const AuditLog = require('../models/AuditLog');
const { getPagination } = require('../utils/helpers');

const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort(sort).skip(skip).limit(limit);

    res.json({ success: true, data: logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('user', 'name email role');
    if (!log) return res.status(404).json({ success: false, message: 'Audit log not found' });
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get audit trail for a specific entity
const getEntityAuditTrail = async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    const logs = await AuditLog.find({ entity, entityId })
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAuditLogs, getAuditLog, getEntityAuditTrail };
