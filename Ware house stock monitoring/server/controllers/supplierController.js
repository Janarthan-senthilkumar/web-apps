const Supplier = require('../models/Supplier');
const { getPagination, createAuditLog } = require('../utils/helpers');

const getSuppliers = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
        { contactPerson: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Supplier.countDocuments(filter);
    const suppliers = await Supplier.find(filter).sort(sort).skip(skip).limit(limit);
    res.json({ success: true, data: suppliers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    await createAuditLog({
      action: 'create', entity: 'supplier', entityId: supplier._id,
      user: req.user._id, description: `Created supplier: ${supplier.name}`, req,
    });
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    await createAuditLog({
      action: 'update', entity: 'supplier', entityId: supplier._id,
      user: req.user._id, description: `Updated supplier: ${supplier.name}`, req,
    });
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    await createAuditLog({
      action: 'delete', entity: 'supplier', entityId: supplier._id,
      user: req.user._id, description: `Deactivated supplier: ${supplier.name}`, req,
    });
    res.json({ success: true, message: 'Supplier deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };
