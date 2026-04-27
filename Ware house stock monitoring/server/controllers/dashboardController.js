const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');
const Warehouse = require('../models/Warehouse');
const Alert = require('../models/Alert');
const AuditLog = require('../models/AuditLog');
const inventoryIntelligence = require('../services/inventoryIntelligence');

// @desc    Get dashboard overview statistics
// @route   GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Basic counts
    const [totalProducts, totalWarehouses, totalInventory, activeAlerts] = await Promise.all([
      Product.countDocuments({ status: 'active' }),
      Warehouse.countDocuments({ isActive: true }),
      Inventory.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]),
      Alert.countDocuments({ isRead: false }),
    ]);

    // Stock status counts
    const [lowStock, outOfStock, overstock] = await Promise.all([
      Inventory.countDocuments({ status: 'low-stock' }),
      Inventory.countDocuments({ status: 'out-of-stock' }),
      Inventory.countDocuments({ status: 'overstock' }),
    ]);

    // Near-expiry (30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const nearExpiry = await Inventory.countDocuments({
      expiryDate: { $ne: null, $lte: thirtyDaysFromNow, $gte: new Date() },
    });

    // Today's transactions
    const [inboundToday, outboundToday] = await Promise.all([
      StockTransaction.aggregate([
        { $match: { type: 'inward', status: 'completed', createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$quantity' }, count: { $sum: 1 } } },
      ]),
      StockTransaction.aggregate([
        { $match: { type: 'outward', status: 'completed', createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$quantity' }, count: { $sum: 1 } } },
      ]),
    ]);

    // Total stock valuation
    const valuation = await Inventory.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } } } },
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalWarehouses,
        totalStock: totalInventory[0] ? totalInventory[0].total : 0,
        activeAlerts,
        lowStock,
        outOfStock,
        overstock,
        nearExpiry,
        inboundToday: inboundToday[0] ? inboundToday[0].total : 0,
        inboundCountToday: inboundToday[0] ? inboundToday[0].count : 0,
        outboundToday: outboundToday[0] ? outboundToday[0].total : 0,
        outboundCountToday: outboundToday[0] ? outboundToday[0].count : 0,
        stockValuation: valuation[0] ? Math.round(valuation[0].totalValue * 100) / 100 : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Monthly stock movement chart data
// @route   GET /api/dashboard/movement-chart
const getMovementChart = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const movements = await StockTransaction.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            type: '$type',
          },
          total: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Format for chart
    const chartData = {};
    movements.forEach((m) => {
      const key = `${monthNames[m._id.month - 1]} ${m._id.year}`;
      if (!chartData[key]) chartData[key] = { month: key, inward: 0, outward: 0, transfer: 0, adjustment: 0 };
      chartData[key][m._id.type] = m.total;
    });

    res.json({ success: true, data: Object.values(chartData) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Top consumed / fast-moving items
// @route   GET /api/dashboard/top-consumed
const getTopConsumed = async (req, res) => {
  try {
    const data = await inventoryIntelligence.getFastMovingItems(10);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Warehouse-wise summary
// @route   GET /api/dashboard/warehouse-summary
const getWarehouseSummary = async (req, res) => {
  try {
    const summary = await Inventory.aggregate([
      {
        $lookup: { from: 'warehouses', localField: 'warehouse', foreignField: '_id', as: 'wh' },
      },
      { $unwind: '$wh' },
      {
        $group: {
          _id: '$warehouse',
          warehouseName: { $first: '$wh.name' },
          warehouseCode: { $first: '$wh.code' },
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
          lowStockCount: { $sum: { $cond: [{ $eq: ['$status', 'low-stock'] }, 1, 0] } },
          outOfStockCount: { $sum: { $cond: [{ $eq: ['$status', 'out-of-stock'] }, 1, 0] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Category-wise stock distribution
// @route   GET /api/dashboard/category-distribution
const getCategoryDistribution = async (req, res) => {
  try {
    const distribution = await Inventory.aggregate([
      {
        $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'prod' },
      },
      { $unwind: '$prod' },
      {
        $lookup: { from: 'categories', localField: 'prod.category', foreignField: '_id', as: 'cat' },
      },
      { $unwind: '$cat' },
      {
        $group: {
          _id: '$prod.category',
          category: { $first: '$cat.name' },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
          productCount: { $addToSet: '$product' },
        },
      },
      { $project: { category: 1, totalQuantity: 1, totalValue: 1, productCount: { $size: '$productCount' } } },
      { $sort: { totalQuantity: -1 } },
    ]);

    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Recent activity timeline
// @route   GET /api/dashboard/recent-activity
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const activities = await AuditLog.find()
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .limit(limit);
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reorder suggestions
// @route   GET /api/dashboard/reorder-suggestions
const getReorderSuggestions = async (req, res) => {
  try {
    const suggestions = await inventoryIntelligence.getReorderSuggestions();
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Inventory aging
// @route   GET /api/dashboard/aging
const getAging = async (req, res) => {
  try {
    const aging = await inventoryIntelligence.getAgingAnalysis();
    res.json({ success: true, data: aging });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats, getMovementChart, getTopConsumed, getWarehouseSummary,
  getCategoryDistribution, getRecentActivity, getReorderSuggestions, getAging,
};
