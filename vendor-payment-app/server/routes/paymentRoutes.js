const express = require('express');
const router = express.Router();
const { getPayments, getPayment, createPayment, updatePayment, deletePayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getPayments);
router.get('/:id', getPayment);
router.post('/', authorize('admin', 'accountant'), createPayment);
router.put('/:id', authorize('admin', 'accountant'), updatePayment);
router.delete('/:id', authorize('admin'), deletePayment);

module.exports = router;
