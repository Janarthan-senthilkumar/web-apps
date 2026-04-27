const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { getTransactions, getTransaction, createTransaction } = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', [
  body('type').isIn(['inward', 'outward', 'transfer', 'adjustment', 'return', 'damaged', 'expired']).withMessage('Invalid transaction type'),
  body('product').notEmpty().withMessage('Product is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number').custom((v) => v > 0).withMessage('Quantity must be positive'),
], validate, createTransaction);

module.exports = router;
