const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { getPagination, createAuditLog } = require('../utils/helpers');

const getInventory = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    if (req.query.product) filter.product = req.query.product;
    if (req.query.zone) filter.zone = req.query.zone;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      // Need to find products matching search first
      const products = await Product.find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { sku: { $regex: req.query.search, $options: 'i' } },
        ],
      }).select('_id');
      filter.product = { $in: products.map((p) => p._id) };
    }

    const total = await Inventory.countDocuments(filter);
    const inventory = await Inventory.find(filter)
      .populate('product', 'name sku category costPrice sellingPrice reorderLevel maxStockThreshold unitOfMeasure')
      .populate('warehouse', 'name code')
      .populate('zone', 'name code type')
      .sort(sort).skip(skip).limit(limit);

    res.json({ success: true, data: inventory, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('product')
      .populate('warehouse', 'name code')
      .populate('zone', 'name code');
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createInventory = async (req, res) => {
  try {
    // Check if inventory record exists for this product-warehouse-zone combo
    const existing = await Inventory.findOne({
      product: req.body.product,
      warehouse: req.body.warehouse,
      zone: req.body.zone || null,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Inventory record already exists for this product-warehouse-zone combination. Use stock transactions to update quantity.',
      });
    }

    const product = await Product.findById(req.body.product);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const inventory = await Inventory.create({
      ...req.body,
      costPrice: req.body.costPrice || product.costPrice,
    });

    await createAuditLog({
      action: 'create', entity: 'inventory', entityId: inventory._id,
      user: req.user._id, description: `Created inventory record for product in warehouse`, req,
    });

    res.status(201).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { quantity, ...rest } = req.body;
    // Don't allow direct quantity updates - must go through transactions
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true });
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });
    await createAuditLog({
      action: 'delete', entity: 'inventory', entityId: inventory._id,
      user: req.user._id, description: `Deleted inventory record`, req,
    });
    res.json({ success: true, message: 'Inventory record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInventory, getInventoryItem, createInventory, updateInventory, deleteInventory };
