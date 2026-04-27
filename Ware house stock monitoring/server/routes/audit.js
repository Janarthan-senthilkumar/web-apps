const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditLog, getEntityAuditTrail } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager'));
router.get('/', getAuditLogs);
router.get('/trail/:entity/:entityId', getEntityAuditTrail);
router.get('/:id', getAuditLog);

module.exports = router;
