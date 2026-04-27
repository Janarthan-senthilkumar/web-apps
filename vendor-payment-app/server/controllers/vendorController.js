const Vendor = require('../models/Vendor');

// GET /api/vendors
exports.getVendors = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) query.$text = { $search: search };
    if (status) query.status = status;

    const total = await Vendor.countDocuments(query);
    const vendors = await Vendor.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: vendors.length, total, page: Number(page), vendors });
  } catch (err) { next(err); }
};

// GET /api/vendors/:id
exports.getVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('createdBy', 'name email');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ success: true, vendor });
  } catch (err) { next(err); }
};

// POST /api/vendors
exports.createVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, vendor });
  } catch (err) { next(err); }
};

// PUT /api/vendors/:id
exports.updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ success: true, vendor });
  } catch (err) { next(err); }
};

// DELETE /api/vendors/:id
exports.deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    await vendor.deleteOne();
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (err) { next(err); }
};
