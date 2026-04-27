const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { recalculateInvoiceStatus } = require('../services/invoiceService');

// GET /api/payments
exports.getPayments = async (req, res, next) => {
  try {
    const { vendor, invoice, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};
    if (vendor) query.vendor = vendor;
    if (invoice) query.invoice = invoice;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('vendor', 'vendorName vendorCode')
      .populate('invoice', 'invoiceNumber totalAmount')
      .populate('createdBy', 'name')
      .sort('-paymentDate')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: payments.length, total, page: Number(page), payments });
  } catch (err) { next(err); }
};

// GET /api/payments/:id
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('vendor', 'vendorName vendorCode bankDetails')
      .populate('invoice')
      .populate('createdBy', 'name');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ success: true, payment });
  } catch (err) { next(err); }
};

// POST /api/payments
exports.createPayment = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.body.invoice);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (!['Approved', 'Partially Paid', 'Overdue'].includes(invoice.status)) {
      return res.status(400).json({ message: `Cannot pay an invoice with status: ${invoice.status}` });
    }

    const outstanding = invoice.totalAmount - invoice.paidAmount;
    if (req.body.paidAmount > outstanding) {
      return res.status(400).json({ message: `Payment (${req.body.paidAmount}) exceeds outstanding amount (${outstanding})` });
    }

    const payment = await Payment.create({ ...req.body, vendor: invoice.vendor, createdBy: req.user._id });
    await recalculateInvoiceStatus(invoice._id);

    res.status(201).json({ success: true, payment });
  } catch (err) { next(err); }
};

// PUT /api/payments/:id
exports.updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    await recalculateInvoiceStatus(payment.invoice);
    res.json({ success: true, payment });
  } catch (err) { next(err); }
};

// DELETE /api/payments/:id
exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const invoiceId = payment.invoice;
    await payment.deleteOne();
    await recalculateInvoiceStatus(invoiceId);
    res.json({ success: true, message: 'Payment deleted and invoice status updated' });
  } catch (err) { next(err); }
};
