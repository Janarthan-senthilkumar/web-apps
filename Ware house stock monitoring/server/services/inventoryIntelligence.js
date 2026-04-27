const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const StockTransaction = require('../models/StockTransaction');

const inventoryIntelligence = {
  // Detect low-stock items
  async getLowStockItems() {
    const inventory = await Inventory.find({ status: { $ne: 'expired' } })
      .populate('product', 'name sku reorderLevel reorderQuantity')
      .populate('warehouse', 'name code');

    return inventory.filter((inv) => {
      return inv.product && inv.quantity <= inv.product.reorderLevel && inv.quantity > 0;
    });
  },

  // Detect out-of-stock items
  async getOutOfStockItems() {
    return await Inventory.find({ quantity: 0 })
      .populate('product', 'name sku')
      .populate('warehouse', 'name code');
  },

  // Detect overstock items
  async getOverstockItems() {
    const inventory = await Inventory.find()
      .populate('product', 'name sku maxStockThreshold')
      .populate('warehouse', 'name code');

    return inventory.filter((inv) => {
      return inv.product && inv.quantity > inv.product.maxStockThreshold;
    });
  },

  // Detect near-expiry items (within 30 days)
  async getNearExpiryItems(daysThreshold = 30) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);

    return await Inventory.find({
      expiryDate: { $ne: null, $lte: threshold, $gte: new Date() },
    })
      .populate('product', 'name sku')
      .populate('warehouse', 'name code');
  },

  // Detect expired items
  async getExpiredItems() {
    return await Inventory.find({
      expiryDate: { $ne: null, $lt: new Date() },
    })
      .populate('product', 'name sku')
      .populate('warehouse', 'name code');
  },

  // Slow-moving / dead stock detection (no movement in N days)
  async getSlowMovingItems(daysSinceLastMovement = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysSinceLastMovement);

    return await Inventory.find({
      quantity: { $gt: 0 },
      $or: [
        { lastMovementAt: { $lt: cutoff } },
        { lastMovementAt: null },
      ],
    })
      .populate('product', 'name sku costPrice')
      .populate('warehouse', 'name code');
  },

  // Fast-moving items (high turnover in last 30 days)
  async getFastMovingItems(limit = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await StockTransaction.aggregate([
      { $match: { type: 'outward', createdAt: { $gte: thirtyDaysAgo }, status: 'completed' } },
      { $group: { _id: '$product', totalOutward: { $sum: '$quantity' }, txnCount: { $sum: 1 } } },
      { $sort: { totalOutward: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products', localField: '_id', foreignField: '_id', as: 'product',
        },
      },
      { $unwind: '$product' },
      { $project: { product: { name: 1, sku: 1 }, totalOutward: 1, txnCount: 1 } },
    ]);

    return result;
  },

  // Inventory aging analysis
  async getAgingAnalysis() {
    const now = new Date();
    const inventory = await Inventory.find({ quantity: { $gt: 0 } })
      .populate('product', 'name sku costPrice')
      .populate('warehouse', 'name code');

    const buckets = { '0-30': [], '31-60': [], '61-90': [], '91-180': [], '180+': [] };

    inventory.forEach((inv) => {
      const ageInDays = Math.floor((now - (inv.lastRestockedAt || inv.createdAt)) / (1000 * 60 * 60 * 24));
      const value = inv.quantity * (inv.costPrice || (inv.product ? inv.product.costPrice : 0));

      const item = {
        product: inv.product ? inv.product.name : 'Unknown',
        sku: inv.product ? inv.product.sku : '',
        warehouse: inv.warehouse ? inv.warehouse.name : '',
        quantity: inv.quantity,
        ageInDays,
        value: Math.round(value * 100) / 100,
      };

      if (ageInDays <= 30) buckets['0-30'].push(item);
      else if (ageInDays <= 60) buckets['31-60'].push(item);
      else if (ageInDays <= 90) buckets['61-90'].push(item);
      else if (ageInDays <= 180) buckets['91-180'].push(item);
      else buckets['180+'].push(item);
    });

    return buckets;
  },

  // Demand forecasting using simple moving average
  async demandForecast(productId, periods = 3) {
    const product = await Product.findById(productId);
    if (!product || !product.demandHistory || product.demandHistory.length === 0) {
      return { forecast: 0, confidence: 'low', message: 'Insufficient data' };
    }

    const history = product.demandHistory.slice(-periods);
    const avg = history.reduce((sum, h) => sum + h.quantity, 0) / history.length;

    // Weighted average: most recent gets higher weight
    let weightedSum = 0;
    let totalWeight = 0;
    history.forEach((h, i) => {
      const weight = i + 1;
      weightedSum += h.quantity * weight;
      totalWeight += weight;
    });
    const weightedAvg = weightedSum / totalWeight;

    return {
      simpleMovingAverage: Math.round(avg),
      weightedMovingAverage: Math.round(weightedAvg),
      recommendedForecast: Math.round(weightedAvg),
      confidence: history.length >= 6 ? 'high' : history.length >= 3 ? 'medium' : 'low',
      periodsUsed: history.length,
    };
  },

  // Safety stock calculation
  calculateSafetyStock(avgDailyDemand, maxDailyDemand, avgLeadTime, maxLeadTime) {
    // Safety Stock = (Max Daily Usage × Max Lead Time) - (Avg Daily Usage × Avg Lead Time)
    return Math.ceil((maxDailyDemand * maxLeadTime) - (avgDailyDemand * avgLeadTime));
  },

  // EOQ calculation
  calculateEOQ(annualDemand, orderCost, holdingCostPerUnit) {
    // EOQ = sqrt((2 × Annual Demand × Order Cost) / Holding Cost per Unit)
    if (holdingCostPerUnit <= 0) return 0;
    return Math.ceil(Math.sqrt((2 * annualDemand * orderCost) / holdingCostPerUnit));
  },

  // Stock turnover ratio
  async getStockTurnoverRatio(productId, days = 365) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const outwardTotal = await StockTransaction.aggregate([
      { $match: { product: productId, type: 'outward', createdAt: { $gte: cutoff }, status: 'completed' } },
      { $group: { _id: null, totalSold: { $sum: '$quantity' } } },
    ]);

    const avgInventory = await Inventory.aggregate([
      { $match: { product: productId } },
      { $group: { _id: null, avgQty: { $avg: '$quantity' } } },
    ]);

    const sold = outwardTotal[0] ? outwardTotal[0].totalSold : 0;
    const avg = avgInventory[0] ? avgInventory[0].avgQty : 1;

    return {
      turnoverRatio: Math.round((sold / avg) * 100) / 100,
      daysOfInventory: avg > 0 ? Math.round((avg / (sold / days)) * 100) / 100 : Infinity,
    };
  },

  // Reorder suggestions
  async getReorderSuggestions() {
    const lowStock = await this.getLowStockItems();
    const suggestions = [];

    for (const inv of lowStock) {
      if (!inv.product) continue;
      const forecast = await this.demandForecast(inv.product._id);

      suggestions.push({
        product: inv.product.name,
        sku: inv.product.sku,
        warehouse: inv.warehouse ? inv.warehouse.name : '',
        currentStock: inv.quantity,
        reorderLevel: inv.product.reorderLevel,
        suggestedQty: inv.product.reorderQuantity || forecast.recommendedForecast || 50,
        urgency: inv.quantity === 0 ? 'critical' : inv.quantity <= inv.product.reorderLevel / 2 ? 'high' : 'medium',
        forecastedDemand: forecast.recommendedForecast,
      });
    }

    return suggestions.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  },

  // Reorder risk score (0-100)
  calculateReorderRisk(currentStock, reorderLevel, avgDailyDemand, leadTimeDays) {
    if (currentStock === 0) return 100;
    const daysUntilStockout = currentStock / (avgDailyDemand || 1);
    const riskRatio = leadTimeDays / daysUntilStockout;
    const proximityRisk = Math.max(0, 1 - (currentStock - reorderLevel) / reorderLevel) * 50;
    const timeRisk = Math.min(riskRatio * 50, 50);
    return Math.min(Math.round(proximityRisk + timeRisk), 100);
  },
};

module.exports = inventoryIntelligence;
