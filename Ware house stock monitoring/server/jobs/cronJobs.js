const cron = require('node-cron');
const inventoryIntelligence = require('../services/inventoryIntelligence');
const alertService = require('../services/alertService');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

const startCronJobs = (io) => {
  // Run inventory checks every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('[CRON] Running scheduled inventory checks...');
    try {
      // Check low stock
      const lowStockItems = await inventoryIntelligence.getLowStockItems();
      for (const item of lowStockItems) {
        await alertService.createAlert({
          type: 'low-stock',
          severity: item.quantity <= (item.product.reorderLevel / 2) ? 'critical' : 'warning',
          title: `Low Stock: ${item.product.name}`,
          message: `${item.product.name} (${item.product.sku}) has only ${item.quantity} units left in ${item.warehouse ? item.warehouse.name : 'warehouse'}. Reorder level: ${item.product.reorderLevel}`,
          product: item.product._id,
          warehouse: item.warehouse ? item.warehouse._id : null,
          io,
        });
      }

      // Check out of stock
      const outOfStock = await inventoryIntelligence.getOutOfStockItems();
      for (const item of outOfStock) {
        if (!item.product) continue;
        await alertService.createAlert({
          type: 'out-of-stock',
          severity: 'critical',
          title: `Out of Stock: ${item.product.name}`,
          message: `${item.product.name} (${item.product.sku}) is completely out of stock in ${item.warehouse ? item.warehouse.name : 'warehouse'}.`,
          product: item.product._id,
          warehouse: item.warehouse ? item.warehouse._id : null,
          io,
        });
      }

      // Check near expiry
      const nearExpiry = await inventoryIntelligence.getNearExpiryItems(30);
      for (const item of nearExpiry) {
        if (!item.product) continue;
        const daysLeft = Math.ceil((item.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        await alertService.createAlert({
          type: 'near-expiry',
          severity: daysLeft <= 7 ? 'critical' : 'warning',
          title: `Near Expiry: ${item.product.name}`,
          message: `${item.product.name} (${item.product.sku}) expires in ${daysLeft} days. Quantity: ${item.quantity}`,
          product: item.product._id,
          warehouse: item.warehouse ? item.warehouse._id : null,
          metadata: { daysUntilExpiry: daysLeft },
          io,
        });
      }

      // Check overstock
      const overstock = await inventoryIntelligence.getOverstockItems();
      for (const item of overstock) {
        await alertService.createAlert({
          type: 'overstock',
          severity: 'info',
          title: `Overstock: ${item.product.name}`,
          message: `${item.product.name} (${item.product.sku}) has ${item.quantity} units, exceeding max threshold of ${item.product.maxStockThreshold}.`,
          product: item.product._id,
          warehouse: item.warehouse ? item.warehouse._id : null,
          io,
        });
      }

      // Update inventory statuses
      const allInventory = await Inventory.find().populate('product', 'reorderLevel maxStockThreshold');
      for (const inv of allInventory) {
        let newStatus = 'in-stock';
        if (inv.expiryDate && inv.expiryDate < new Date()) newStatus = 'expired';
        else if (inv.quantity === 0) newStatus = 'out-of-stock';
        else if (inv.product && inv.quantity <= inv.product.reorderLevel) newStatus = 'low-stock';
        else if (inv.product && inv.quantity > inv.product.maxStockThreshold) newStatus = 'overstock';

        if (inv.status !== newStatus) {
          inv.status = newStatus;
          await inv.save();
        }
      }

      console.log('[CRON] Inventory checks completed.');
    } catch (error) {
      console.error('[CRON] Error during inventory check:', error.message);
    }
  });

  // Update demand history monthly (1st of each month at midnight)
  cron.schedule('0 0 1 * *', async () => {
    console.log('[CRON] Updating monthly demand history...');
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const month = lastMonth.toLocaleString('default', { month: 'short' });
      const year = lastMonth.getFullYear();

      const StockTransaction = require('../models/StockTransaction');
      const products = await Product.find({ status: 'active' });

      for (const product of products) {
        const outward = await StockTransaction.aggregate([
          {
            $match: {
              product: product._id,
              type: 'outward',
              status: 'completed',
              createdAt: {
                $gte: new Date(year, lastMonth.getMonth(), 1),
                $lt: new Date(year, lastMonth.getMonth() + 1, 1),
              },
            },
          },
          { $group: { _id: null, total: { $sum: '$quantity' } } },
        ]);

        const totalQty = outward[0] ? outward[0].total : 0;
        product.demandHistory.push({ month, year, quantity: totalQty });
        if (product.demandHistory.length > 12) {
          product.demandHistory = product.demandHistory.slice(-12);
        }
        await product.save();
      }

      console.log('[CRON] Demand history update completed.');
    } catch (error) {
      console.error('[CRON] Error updating demand history:', error.message);
    }
  });

  console.log('[CRON] Scheduled jobs initialized.');
};

module.exports = { startCronJobs };
