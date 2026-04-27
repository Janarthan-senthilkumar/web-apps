const Invoice = require('../models/Invoice');
const Vendor = require('../models/Vendor');
const Payment = require('../models/Payment');

// GET /api/dashboard/summary
exports.getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalVendors,
      totalInvoices,
      pendingApprovals,
      overdueInvoices,
      paidInvoices,
      dueIn7Days,
      outstandingAgg,
      monthlyInvoices,
      monthlyPayments,
      statusBreakdown,
    ] = await Promise.all([
      Vendor.countDocuments({ status: 'active' }),
      Invoice.countDocuments(),
      Invoice.countDocuments({ status: 'Submitted' }),
      Invoice.countDocuments({ status: 'Overdue' }),
      Invoice.countDocuments({ status: 'Paid' }),
      Invoice.countDocuments({ status: { $in: ['Approved', 'Partially Paid'] }, dueDate: { $gte: now, $lte: next7Days } }),
      Invoice.aggregate([
        { $match: { status: { $nin: ['Paid', 'Rejected', 'Draft'] } } },
        { $group: { _id: null, outstanding: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } } } },
      ]),
      Invoice.aggregate([
        { $match: { invoiceDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
        {
          $group: {
            _id: { year: { $year: '$invoiceDate' }, month: { $month: '$invoiceDate' } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Payment.aggregate([
        { $match: { paymentDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
        {
          $group: {
            _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
            total: { $sum: '$paidAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Invoice.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const outstandingAmount = outstandingAgg[0]?.outstanding || 0;

    res.json({
      success: true,
      summary: {
        totalVendors,
        totalInvoices,
        pendingApprovals,
        overdueInvoices,
        paidInvoices,
        dueIn7Days,
        outstandingAmount,
      },
      charts: {
        monthlyInvoices,
        monthlyPayments,
        statusBreakdown,
      },
    });
  } catch (err) { next(err); }
};
