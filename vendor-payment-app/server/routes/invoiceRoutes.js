const express = require('express');
const router = express.Router();
const {
  getInvoices, getInvoice, createInvoice, updateInvoice,
  deleteInvoice, approveInvoice, rejectInvoice, submitInvoice,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', authorize('admin', 'accountant'), upload.single('attachment'), createInvoice);
router.put('/:id', authorize('admin', 'accountant'), upload.single('attachment'), updateInvoice);
router.delete('/:id', authorize('admin'), deleteInvoice);
router.patch('/:id/submit', authorize('admin', 'accountant'), submitInvoice);
router.patch('/:id/approve', authorize('admin'), approveInvoice);
router.patch('/:id/reject', authorize('admin'), rejectInvoice);

module.exports = router;
