const Invoice = require('../models/Invoice');
const { recalculateInvoiceStatus } = require('../services/invoiceService');

// GET /api/invoices
exports.getInvoices = async (req, res, next) => {
  try {
    const { vendor, status, category, search, startDate, endDate, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};

    if (vendor) query.vendor = vendor;
    if (status) {
      const statuses = String(status)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      query.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
    }
    if (category) query.category = category;
    if (search) query.invoiceNumber = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('vendor', 'vendorName vendorCode email')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: invoices.length, total, page: Number(page), invoices });
  } catch (err) { next(err); }
};

// GET /api/invoices/:id
exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendor')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};

// POST /api/invoices
exports.createInvoice = async (req, res, next) => {
  try {
    const body = { ...req.body, createdBy: req.user._id };
    if (req.file) body.attachmentUrl = `/uploads/${req.file.filename}`;

    // Check duplicate invoice number per vendor
    const duplicate = await Invoice.findOne({ invoiceNumber: body.invoiceNumber?.toUpperCase(), vendor: body.vendor });
    if (duplicate) return res.status(400).json({ message: 'Invoice number already exists for this vendor' });

    const invoice = await Invoice.create(body);
    await invoice.populate('vendor', 'vendorName vendorCode');
    res.status(201).json({ success: true, invoice });
  } catch (err) { next(err); }
};

// PUT /api/invoices/:id
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (['Paid', 'Approved'].includes(invoice.status) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot edit a Paid or Approved invoice' });
    }

    const updates = { ...req.body };
    if (req.file) updates.attachmentUrl = `/uploads/${req.file.filename}`;

    Object.assign(invoice, updates);
    await invoice.save();
    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};

// DELETE /api/invoices/:id
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.paidAmount > 0) return res.status(400).json({ message: 'Cannot delete invoice with payments' });
    await invoice.deleteOne();
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) { next(err); }
};

// PATCH /api/invoices/:id/approve  (Admin only)
exports.approveInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.status !== 'Submitted') return res.status(400).json({ message: 'Only submitted invoices can be approved' });

    invoice.status = 'Approved';
    invoice.approvedBy = req.user._id;
    invoice.approvedAt = new Date();
    invoice.approvalNotes = req.body.notes || '';
    await invoice.save();
    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};

// PATCH /api/invoices/:id/reject  (Admin only)
exports.rejectInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (!['Submitted', 'Approved'].includes(invoice.status)) {
      return res.status(400).json({ message: 'Only submitted or approved invoices can be rejected' });
    }

    invoice.status = 'Rejected';
    invoice.approvalNotes = req.body.notes || 'Rejected';
    await invoice.save();
    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};

// PATCH /api/invoices/:id/submit
exports.submitInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (!['Draft', 'Rejected'].includes(invoice.status)) {
      return res.status(400).json({ message: 'Only Draft or Rejected invoices can be submitted' });
    }
    invoice.status = 'Submitted';
    await invoice.save();
    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};
