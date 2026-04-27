const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { getPagination, createAuditLog } = require('../utils/helpers');

const getWarehouses = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Warehouse.countDocuments(filter);
    const warehouses = await Warehouse.find(filter)
      .populate('manager', 'name email')
      .sort(sort).skip(skip).limit(limit);

    res.json({ success: true, data: warehouses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id).populate('manager', 'name email');
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });

    // Get inventory summary for this warehouse
    const inventorySummary = await Inventory.aggregate([
      { $match: { warehouse: warehouse._id } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
        },
      },
    ]);

    res.json({ success: true, data: warehouse, inventorySummary: inventorySummary[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.create(req.body);

    const products = await Product.find({ status: { $ne: 'discontinued' } }).select('_id costPrice');
    if (products.length) {
      const operations = products.map((product) => ({
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
    }

    await createAuditLog({
      action: 'create', entity: 'warehouse', entityId: warehouse._id,
      user: req.user._id, description: `Created warehouse: ${warehouse.name}`, req,
    });
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });

    await createAuditLog({
      action: 'update', entity: 'warehouse', entityId: warehouse._id,
      user: req.user._id, description: `Updated warehouse: ${warehouse.name}`, req,
    });
    res.json({ success: true, data: warehouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });

    await createAuditLog({
      action: 'delete', entity: 'warehouse', entityId: warehouse._id,
      user: req.user._id, description: `Deactivated warehouse: ${warehouse.name}`, req,
    });
    res.json({ success: true, message: 'Warehouse deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse };
