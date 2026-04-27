const express = require('express');
const router = express.Router();
const {
  currentStockReport, stockMovementReport, warehouseUtilizationReport,
  inventoryAgingReport, reorderReport, expiryReport,
  supplierInventoryReport, categoryStockReport, valuationReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/current-stock', currentStockReport);
router.get('/stock-movement', stockMovementReport);
router.get('/warehouse-utilization', warehouseUtilizationReport);
router.get('/inventory-aging', inventoryAgingReport);
router.get('/reorder', reorderReport);
router.get('/expiry', expiryReport);
router.get('/supplier-inventory', supplierInventoryReport);
router.get('/category-stock', categoryStockReport);
router.get('/valuation', valuationReport);

module.exports = router;
