const express = require('express');
const router = express.Router();
const replacementController = require('../controllers/replacementController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { replacementRecordRules, handleValidation } = require('../middleware/validate');

// All routes require authentication
router.use(authMiddleware);

// GET all replacement records
router.get('/', replacementController.getAll);

// GET single replacement record
router.get('/:id', replacementController.getById);

// POST create replacement record (supervisor only - approve & replace)
router.post('/', requireRole('supervisor'), replacementRecordRules, handleValidation, replacementController.create);

// PUT update replacement record (supervisor only)
router.put('/:id', requireRole('supervisor'), replacementRecordRules, handleValidation, replacementController.update);

// DELETE replacement record (supervisor only)
router.delete('/:id', requireRole('supervisor'), replacementController.remove);

module.exports = router;
