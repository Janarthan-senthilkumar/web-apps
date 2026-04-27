const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Warehouse = require('../models/Warehouse');
const { getPagination, createAuditLog } = require('../utils/helpers');
const inventoryIntelligence = require('../services/inventoryIntelligence');

const syncProductInventoryAcrossWarehouses = async (product) => {
  const warehouses = await Warehouse.find({ isActive: true }).select('_id');
  if (!warehouses.length) return;

  const operations = warehouses.map((warehouse) => ({
    updateOne: {
      filter: { product: product._id, warehouse: warehouse._id, zone: null },
      update: {
        $setOnInsert: {
          product: product._id,
          warehouse: warehouse._id,
          zone: null,
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          costPrice: product.costPrice,
          status: 'out-of-stock',
        },
      },
      upsert: true,
    },
  }));

  await Inventory.bulkWrite(operations, { ordered: false });
};

const getProducts = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.supplier) filter.supplier = req.query.supplier;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
        { barcode: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name code')
      .populate('supplier', 'name code')
      .sort(sort).skip(skip).limit(limit);

    res.json({ success: true, data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name code')
      .populate('supplier', 'name code contactPerson email phone');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Get inventory across warehouses
    const inventory = await Inventory.find({ product: product._id })
      .populate('warehouse', 'name code')
      .populate('zone', 'name code');

    // Get forecast
    const forecast = await inventoryIntelligence.demandForecast(product._id);

    res.json({ success: true, data: product, inventory, forecast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await syncProductInventoryAcrossWarehouses(product);

    await createAuditLog({
      action: 'create', entity: 'product', entityId: product._id,
      user: req.user._id, description: `Created product: ${product.name} (${product.sku})`, req,
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await syncProductInventoryAcrossWarehouses(product);

    await createAuditLog({
      action: 'update', entity: 'product', entityId: product._id,
      user: req.user._id, description: `Updated product: ${product.name}`, req,
    });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: 'discontinued' }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await createAuditLog({
      action: 'delete', entity: 'product', entityId: product._id,
      user: req.user._id, description: `Discontinued product: ${product.name}`, req,
    });
    res.json({ success: true, message: 'Product discontinued' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
