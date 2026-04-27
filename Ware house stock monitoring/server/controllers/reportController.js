const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const Warehouse = require('../models/Warehouse');
const Supplier = require('../models/Supplier');
const inventoryIntelligence = require('../services/inventoryIntelligence');

// @desc    Current stock report
const currentStockReport = async (req, res) => {
  try {
    const filter = {};
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    if (req.query.status) filter.status = req.query.status;

    const inventory = await Inventory.find(filter)
      .populate('product', 'name sku category costPrice sellingPrice reorderLevel unitOfMeasure')
      .populate('warehouse', 'name code')
      .populate('zone', 'name code')
      .sort('product.name');

    const totalValue = inventory.reduce((sum, inv) => sum + (inv.quantity * inv.costPrice), 0);

    res.json({ success: true, data: inventory, summary: { totalItems: inventory.length, totalValue: Math.round(totalValue * 100) / 100 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stock movement report
const stockMovementReport = async (req, res) => {
  try {
    const filter = { status: 'completed' };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.product) filter.product = req.query.product;
    if (req.query.warehouse) {
      filter.$or = [
        { sourceWarehouse: req.query.warehouse },
        { destinationWarehouse: req.query.warehouse },
      ];
    }
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const transactions = await StockTransaction.find(filter)
      .populate('product', 'name sku')
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('performedBy', 'name')
      .sort('-createdAt');

    const summary = await StockTransaction.aggregate([
      { $match: filter },
      { $group: { _id: '$type', totalQuantity: { $sum: '$quantity' }, totalValue: { $sum: '$totalCost' }, count: { $sum: 1 } } },
    ]);

    res.json({ success: true, data: transactions, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Warehouse utilization report
const warehouseUtilizationReport = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true });
    const report = [];

    for (const wh of warehouses) {
      const invStats = await Inventory.aggregate([
        { $match: { warehouse: wh._id } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
          },
        },
      ]);

      report.push({
        warehouse: wh.name,
        code: wh.code,
        capacity: wh.capacity,
        utilized: invStats[0] ? invStats[0].totalQuantity : 0,
        utilization: wh.capacity > 0 ? Math.round(((invStats[0] ? invStats[0].totalQuantity : 0) / wh.capacity) * 100) : 0,
        totalItems: invStats[0] ? invStats[0].totalItems : 0,
        totalValue: invStats[0] ? Math.round(invStats[0].totalValue * 100) / 100 : 0,
      });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Inventory aging report
const inventoryAgingReport = async (req, res) => {
  try {
    const aging = await inventoryIntelligence.getAgingAnalysis();
    const summary = {};
    for (const [bucket, items] of Object.entries(aging)) {
      summary[bucket] = {
        count: items.length,
        totalValue: items.reduce((sum, i) => sum + i.value, 0),
        items: items.slice(0, 20), // Limit items per bucket
      };
    }
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reorder report
const reorderReport = async (req, res) => {
  try {
    const suggestions = await inventoryIntelligence.getReorderSuggestions();
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Expiry report
const expiryReport = async (req, res) => {
  try {
    const daysThreshold = parseInt(req.query.days) || 60;
    const nearExpiry = await inventoryIntelligence.getNearExpiryItems(daysThreshold);
    const expired = await inventoryIntelligence.getExpiredItems();
    res.json({ success: true, data: { nearExpiry, expired } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Supplier-wise inventory report
const supplierInventoryReport = async (req, res) => {
  try {
    const report = await Inventory.aggregate([
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' } },
      { $unwind: '$prod' },
      { $lookup: { from: 'suppliers', localField: 'prod.supplier', foreignField: '_id', as: 'sup' } },
      { $unwind: { path: '$sup', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$prod.supplier',
          supplierName: { $first: '$sup.name' },
          supplierCode: { $first: '$sup.code' },
          totalProducts: { $addToSet: '$product' },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
        },
      },
      { $project: { supplierName: 1, supplierCode: 1, totalProducts: { $size: '$totalProducts' }, totalQuantity: 1, totalValue: { $round: ['$totalValue', 2] } } },
      { $sort: { totalValue: -1 } },
    ]);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Category-wise stock report
const categoryStockReport = async (req, res) => {
  try {
    const report = await Inventory.aggregate([
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' } },
      { $unwind: '$prod' },
      { $lookup: { from: 'categories', localField: 'prod.category', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      {
        $group: {
          _id: '$prod.category',
          categoryName: { $first: '$cat.name' },
          categoryCode: { $first: '$cat.code' },
          totalProducts: { $addToSet: '$product' },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
          lowStockCount: { $sum: { $cond: [{ $eq: ['$status', 'low-stock'] }, 1, 0] } },
        },
      },
      { $project: { categoryName: 1, categoryCode: 1, totalProducts: { $size: '$totalProducts' }, totalQuantity: 1, totalValue: { $round: ['$totalValue', 2] }, lowStockCount: 1 } },
      { $sort: { totalValue: -1 } },
    ]);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Valuation report
const valuationReport = async (req, res) => {
  try {
    const filter = {};
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;

    const inventory = await Inventory.find(filter)
      .populate('product', 'name sku costPrice sellingPrice')
      .populate('warehouse', 'name code');

    let totalCostValue = 0;
    let totalSellingValue = 0;
    const items = inventory.map((inv) => {
      const costValue = inv.quantity * (inv.costPrice || (inv.product ? inv.product.costPrice : 0));
      const sellingValue = inv.quantity * (inv.product ? inv.product.sellingPrice : 0);
      totalCostValue += costValue;
      totalSellingValue += sellingValue;
      return {
        product: inv.product ? inv.product.name : '',
        sku: inv.product ? inv.product.sku : '',
        warehouse: inv.warehouse ? inv.warehouse.name : '',
        quantity: inv.quantity,
        costPrice: inv.costPrice || (inv.product ? inv.product.costPrice : 0),
        sellingPrice: inv.product ? inv.product.sellingPrice : 0,
        costValue: Math.round(costValue * 100) / 100,
        sellingValue: Math.round(sellingValue * 100) / 100,
      };
    });

    res.json({
      success: true,
      data: items,
      summary: {
        totalCostValue: Math.round(totalCostValue * 100) / 100,
        totalSellingValue: Math.round(totalSellingValue * 100) / 100,
        potentialProfit: Math.round((totalSellingValue - totalCostValue) * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  currentStockReport, stockMovementReport, warehouseUtilizationReport,
  inventoryAgingReport, reorderReport, expiryReport, supplierInventoryReport,
  categoryStockReport, valuationReport,
};
