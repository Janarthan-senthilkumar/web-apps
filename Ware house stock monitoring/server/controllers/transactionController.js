const StockTransaction = require('../models/StockTransaction');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { getPagination, createAuditLog, generateRefNumber } = require('../utils/helpers');
const alertService = require('../services/alertService');

const getTransactions = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.product) filter.product = req.query.product;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.sourceWarehouse) filter.sourceWarehouse = req.query.sourceWarehouse;
    if (req.query.destinationWarehouse) filter.destinationWarehouse = req.query.destinationWarehouse;
    if (req.query.performedBy) filter.performedBy = req.query.performedBy;
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }
    if (req.query.search) {
      filter.$or = [
        { referenceNumber: { $regex: req.query.search, $options: 'i' } },
        { remarks: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await StockTransaction.countDocuments(filter);
    const transactions = await StockTransaction.find(filter)
      .populate('product', 'name sku')
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('performedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort(sort).skip(skip).limit(limit);

    res.json({ success: true, data: transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTransaction = async (req, res) => {
  try {
    const txn = await StockTransaction.findById(req.params.id)
      .populate('product', 'name sku category')
      .populate('sourceWarehouse', 'name code')
      .populate('destinationWarehouse', 'name code')
      .populate('sourceZone', 'name code')
      .populate('destinationZone', 'name code')
      .populate('performedBy', 'name email')
      .populate('approvedBy', 'name email');
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: txn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create stock transaction (inward, outward, transfer, adjustment, return, damaged, expired)
const createTransaction = async (req, res) => {
  try {
    const {
      type, product: productId, quantity, sourceWarehouse, sourceZone,
      destinationWarehouse, destinationZone, batchNumber, unitCost, remarks, reason,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const io = req.app.get('io');
    let referenceNumber = generateRefNumber(type.toUpperCase().substring(0, 3));

    // Handle different transaction types
    switch (type) {
      case 'inward': {
        let inventory = await Inventory.findOne({ product: productId, warehouse: destinationWarehouse, zone: destinationZone || null });
        const prevQty = inventory ? inventory.quantity : 0;

        if (!inventory) {
          inventory = await Inventory.create({
            product: productId, warehouse: destinationWarehouse, zone: destinationZone,
            quantity, costPrice: unitCost || product.costPrice, batchNumber,
            lastRestockedAt: new Date(), lastMovementAt: new Date(),
          });
        } else {
          inventory.quantity += quantity;
          inventory.lastRestockedAt = new Date();
          inventory.lastMovementAt = new Date();
          await inventory.save();
        }

        const txn = await StockTransaction.create({
          referenceNumber, type, product: productId, quantity,
          previousQuantity: prevQty, newQuantity: inventory.quantity,
          destinationWarehouse, destinationZone, batchNumber,
          unitCost: unitCost || product.costPrice,
          totalCost: (unitCost || product.costPrice) * quantity,
          performedBy: req.user._id, status: 'completed', remarks,
        });

        // Check overstock
        if (inventory.quantity > product.maxStockThreshold) {
          await alertService.createAlert({
            type: 'overstock', severity: 'info',
            title: `Overstock: ${product.name}`,
            message: `${product.name} now has ${inventory.quantity} units (max: ${product.maxStockThreshold})`,
            product: productId, warehouse: destinationWarehouse, io,
          });
        }

        if (io) io.emit('stock-update', { type: 'inward', product: productId, warehouse: destinationWarehouse, newQuantity: inventory.quantity });

        await createAuditLog({
          action: 'stock-inward', entity: 'transaction', entityId: txn._id,
          user: req.user._id, description: `Stock inward: ${quantity} x ${product.name}`,
          changes: { before: { quantity: prevQty }, after: { quantity: inventory.quantity } }, req,
        });

        return res.status(201).json({ success: true, data: txn });
      }

      case 'outward': {
        const inventory = await Inventory.findOne({ product: productId, warehouse: sourceWarehouse, zone: sourceZone || null });
        if (!inventory || inventory.quantity < quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${inventory ? inventory.quantity : 0}` });
        }

        const prevQty = inventory.quantity;
        inventory.quantity -= quantity;
        inventory.lastMovementAt = new Date();
        await inventory.save();

        const txn = await StockTransaction.create({
          referenceNumber, type, product: productId, quantity,
          previousQuantity: prevQty, newQuantity: inventory.quantity,
          sourceWarehouse, sourceZone, unitCost: unitCost || product.costPrice,
          totalCost: (unitCost || product.costPrice) * quantity,
          performedBy: req.user._id, status: 'completed', remarks,
        });

        // Check low stock / out of stock
        if (inventory.quantity === 0) {
          await alertService.createAlert({
            type: 'out-of-stock', severity: 'critical',
            title: `Out of Stock: ${product.name}`,
            message: `${product.name} is now out of stock in warehouse`,
            product: productId, warehouse: sourceWarehouse, io,
          });
        } else if (inventory.quantity <= product.reorderLevel) {
          await alertService.createAlert({
            type: 'low-stock', severity: 'warning',
            title: `Low Stock: ${product.name}`,
            message: `${product.name} has ${inventory.quantity} units left (reorder level: ${product.reorderLevel})`,
            product: productId, warehouse: sourceWarehouse, io,
          });
        }

        if (io) io.emit('stock-update', { type: 'outward', product: productId, warehouse: sourceWarehouse, newQuantity: inventory.quantity });

        await createAuditLog({
          action: 'stock-outward', entity: 'transaction', entityId: txn._id,
          user: req.user._id, description: `Stock outward: ${quantity} x ${product.name}`,
          changes: { before: { quantity: prevQty }, after: { quantity: inventory.quantity } }, req,
        });

        return res.status(201).json({ success: true, data: txn });
      }

      case 'transfer': {
        // Deduct from source
        const srcInv = await Inventory.findOne({ product: productId, warehouse: sourceWarehouse, zone: sourceZone || null });
        if (!srcInv || srcInv.quantity < quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock at source. Available: ${srcInv ? srcInv.quantity : 0}` });
        }

        const srcPrev = srcInv.quantity;
        srcInv.quantity -= quantity;
        srcInv.lastMovementAt = new Date();
        await srcInv.save();

        // Add to destination
        let destInv = await Inventory.findOne({ product: productId, warehouse: destinationWarehouse, zone: destinationZone || null });
        const destPrev = destInv ? destInv.quantity : 0;

        if (!destInv) {
          destInv = await Inventory.create({
            product: productId, warehouse: destinationWarehouse, zone: destinationZone,
            quantity, costPrice: product.costPrice, lastRestockedAt: new Date(), lastMovementAt: new Date(),
          });
        } else {
          destInv.quantity += quantity;
          destInv.lastMovementAt = new Date();
          await destInv.save();
        }

        const txn = await StockTransaction.create({
          referenceNumber, type, product: productId, quantity,
          previousQuantity: srcPrev, newQuantity: srcInv.quantity,
          sourceWarehouse, sourceZone, destinationWarehouse, destinationZone,
          unitCost: product.costPrice, totalCost: product.costPrice * quantity,
          performedBy: req.user._id, status: 'completed', remarks,
        });

        if (io) {
          io.emit('stock-update', { type: 'transfer', product: productId });
        }

        await createAuditLog({
          action: 'stock-transfer', entity: 'transaction', entityId: txn._id,
          user: req.user._id, description: `Stock transfer: ${quantity} x ${product.name}`, req,
        });

        return res.status(201).json({ success: true, data: txn });
      }

      case 'adjustment': {
        const inventory = await Inventory.findOne({ product: productId, warehouse: sourceWarehouse || destinationWarehouse, zone: sourceZone || destinationZone || null });
        if (!inventory) return res.status(404).json({ success: false, message: 'Inventory record not found' });

        const prevQty = inventory.quantity;
        inventory.quantity = quantity; // Set to exact quantity
        inventory.lastMovementAt = new Date();
        await inventory.save();

        const txn = await StockTransaction.create({
          referenceNumber, type, product: productId,
          quantity: Math.abs(quantity - prevQty),
          previousQuantity: prevQty, newQuantity: quantity,
          sourceWarehouse: sourceWarehouse || destinationWarehouse,
          performedBy: req.user._id, status: 'completed', remarks, reason,
        });

        if (io) io.emit('stock-update', { type: 'adjustment', product: productId });

        await createAuditLog({
          action: 'stock-adjustment', entity: 'transaction', entityId: txn._id,
          user: req.user._id, description: `Stock adjustment: ${product.name} from ${prevQty} to ${quantity}`,
          changes: { before: { quantity: prevQty }, after: { quantity } }, req,
        });

        return res.status(201).json({ success: true, data: txn });
      }

      case 'return': {
        let inventory = await Inventory.findOne({ product: productId, warehouse: destinationWarehouse || sourceWarehouse, zone: destinationZone || null });
        const prevQty = inventory ? inventory.quantity : 0;

        if (!inventory) {
          inventory = await Inventory.create({
            product: productId, warehouse: destinationWarehouse || sourceWarehouse,
            zone: destinationZone, quantity, costPrice: product.costPrice,
            lastMovementAt: new Date(),
          });
        } else {
          inventory.quantity += quantity;
          inventory.lastMovementAt = new Date();
          await inventory.save();
        }

        const txn = await StockTransaction.create({
          referenceNumber, type, product: productId, quantity,
          previousQuantity: prevQty, newQuantity: inventory.quantity,
          destinationWarehouse: destinationWarehouse || sourceWarehouse,
          performedBy: req.user._id, status: 'completed', remarks, reason,
        });

        if (io) io.emit('stock-update', { type: 'return', product: productId });

        await createAuditLog({
          action: 'stock-return', entity: 'transaction', entityId: txn._id,
          user: req.user._id, description: `Stock return: ${quantity} x ${product.name}`, req,
        });

        return res.status(201).json({ success: true, data: txn });
      }

      case 'damaged':
      case 'expired': {
        const inventory = await Inventory.findOne({ product: productId, warehouse: sourceWarehouse, zone: sourceZone || null });
        if (!inventory || inventory.quantity < quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${inventory ? inventory.quantity : 0}` });
        }

        const prevQty = inventory.quantity;
        inventory.quantity -= quantity;
        inventory.lastMovementAt = new Date();
        if (type === 'expired') inventory.status = 'expired';
        await inventory.save();

        const txn = await StockTransaction.create({
          referenceNumber, type, product: productId, quantity,
          previousQuantity: prevQty, newQuantity: inventory.quantity,
          sourceWarehouse, sourceZone,
          performedBy: req.user._id, status: 'completed', remarks, reason,
        });

        await alertService.createAlert({
          type: type === 'damaged' ? 'abnormal-movement' : 'expired',
          severity: 'warning',
          title: `${type === 'damaged' ? 'Damaged' : 'Expired'} Stock: ${product.name}`,
          message: `${quantity} units of ${product.name} marked as ${type}. Reason: ${reason || 'N/A'}`,
          product: productId, warehouse: sourceWarehouse, io,
        });

        if (io) io.emit('stock-update', { type, product: productId });

        await createAuditLog({
          action: `stock-${type === 'damaged' ? 'damaged' : 'return'}`, entity: 'transaction', entityId: txn._id,
          user: req.user._id, description: `${type} stock: ${quantity} x ${product.name}`, req,
        });

        return res.status(201).json({ success: true, data: txn });
      }

      default:
        return res.status(400).json({ success: false, message: 'Invalid transaction type' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTransactions, getTransaction, createTransaction };
