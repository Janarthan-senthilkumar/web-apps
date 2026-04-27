const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Vendor = require('../models/Vendor');

// GET /api/reports/outstanding
exports.getOutstandingReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { status: { $nin: ['Paid', 'Rejected', 'Draft'] } };
    if (startDate) match.dueDate = { $gte: new Date(startDate) };
    if (endDate) match.dueDate = { ...match.dueDate, $lte: new Date(endDate) };

    const invoices = await Invoice.find(match)
      .populate('vendor', 'vendorName vendorCode email paymentTerms')
      .sort('dueDate');

    const data = invoices.map(inv => ({
      invoiceNumber: inv.invoiceNumber,
      vendor: inv.vendor?.vendorName,
      vendorCode: inv.vendor?.vendorCode,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      outstanding: inv.totalAmount - inv.paidAmount,
      status: inv.status,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

// GET /api/reports/vendor-wise
exports.getVendorWiseReport = async (req, res, next) => {
  try {
    const data = await Invoice.aggregate([
      { $match: { status: { $nin: ['Draft', 'Rejected'] } } },
      {
        $group: {
          _id: '$vendor',
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          outstanding: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
        },
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      { $unwind: '$vendor' },
      { $sort: { outstanding: -1 } },
      {
        $project: {
          vendorName: '$vendor.vendorName',
          vendorCode: '$vendor.vendorCode',
          totalInvoices: 1,
          totalAmount: 1,
          paidAmount: 1,
          outstanding: 1,
        },
      },
    ]);

    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

// GET /api/reports/payments
exports.getPaymentReport = async (req, res, next) => {
  try {
    const { startDate, endDate, vendor } = req.query;
    const match = {};
    if (vendor) match.vendor = vendor;
    if (startDate || endDate) {
      match.paymentDate = {};
      if (startDate) match.paymentDate.$gte = new Date(startDate);
      if (endDate) match.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(match)
      .populate('vendor', 'vendorName vendorCode')
      .populate('invoice', 'invoiceNumber totalAmount')
      .sort('-paymentDate');

    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) { next(err); }
};
