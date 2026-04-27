const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Warehouse = require('../models/Warehouse');
const Zone = require('../models/Zone');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const StockTransaction = require('../models/StockTransaction');
const Alert = require('../models/Alert');
const AuditLog = require('../models/AuditLog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/warehouse_stock_monitor';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Warehouse.deleteMany({}), Zone.deleteMany({}),
      Category.deleteMany({}), Supplier.deleteMany({}), Product.deleteMany({}),
      Inventory.deleteMany({}), StockTransaction.deleteMany({}),
      Alert.deleteMany({}), AuditLog.deleteMany({}),
    ]);
    console.log('Cleared existing data.');

    // --- USERS ---
    const users = await User.create([
      { name: 'Admin User', email: 'admin@warehouse.com', password: 'admin123', role: 'admin', phone: '+91-9876543210' },
      { name: 'Rajesh Kumar', email: 'manager@warehouse.com', password: 'manager123', role: 'manager', phone: '+91-9876543211' },
      { name: 'Priya Sharma', email: 'manager2@warehouse.com', password: 'manager123', role: 'manager', phone: '+91-9876543212' },
      { name: 'Amit Singh', email: 'staff@warehouse.com', password: 'staff123', role: 'staff', phone: '+91-9876543213' },
      { name: 'Sneha Patel', email: 'staff2@warehouse.com', password: 'staff123', role: 'staff', phone: '+91-9876543214' },
    ]);
    console.log(`Created ${users.length} users.`);

    // --- WAREHOUSES ---
    const warehouses = await Warehouse.create([
      { name: 'Mumbai Central Warehouse', code: 'WH-MUM', address: { street: '123 Industrial Area', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' }, capacity: 50000, manager: users[1]._id, contactPhone: '+91-22-12345678', contactEmail: 'mumbai@warehouse.com', description: 'Main distribution center' },
      { name: 'Delhi North Hub', code: 'WH-DEL', address: { street: '456 Logistics Park', city: 'New Delhi', state: 'Delhi', zipCode: '110001', country: 'India' }, capacity: 35000, manager: users[2]._id, contactPhone: '+91-11-87654321', contactEmail: 'delhi@warehouse.com', description: 'Northern region hub' },
      { name: 'Bangalore Tech Park', code: 'WH-BLR', address: { street: '789 IT Corridor', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India' }, capacity: 25000, manager: users[1]._id, contactPhone: '+91-80-11223344', contactEmail: 'bangalore@warehouse.com', description: 'Tech products storage' },
    ]);
    console.log(`Created ${warehouses.length} warehouses.`);

    // --- ZONES ---
    const zones = await Zone.create([
      { name: 'Zone A - Electronics', code: 'ZA', warehouse: warehouses[0]._id, type: 'zone', capacity: 10000 },
      { name: 'Zone B - FMCG', code: 'ZB', warehouse: warehouses[0]._id, type: 'zone', capacity: 15000 },
      { name: 'Rack A1', code: 'RA1', warehouse: warehouses[0]._id, type: 'rack', capacity: 2000 },
      { name: 'Zone C - Heavy', code: 'ZC', warehouse: warehouses[1]._id, type: 'zone', capacity: 12000 },
      { name: 'Bin D1', code: 'BD1', warehouse: warehouses[1]._id, type: 'bin', capacity: 500 },
      { name: 'Zone E - Cold', code: 'ZE', warehouse: warehouses[2]._id, type: 'zone', capacity: 8000 },
    ]);
    console.log(`Created ${zones.length} zones.`);

    // --- CATEGORIES ---
    const categories = await Category.create([
      { name: 'Electronics', code: 'ELEC', description: 'Electronic devices and components' },
      { name: 'FMCG', code: 'FMCG', description: 'Fast moving consumer goods' },
      { name: 'Industrial Equipment', code: 'INDU', description: 'Heavy industrial machines and parts' },
      { name: 'Raw Materials', code: 'RAWM', description: 'Manufacturing raw materials' },
      { name: 'Automotive Parts', code: 'AUTO', description: 'Vehicle parts and accessories' },
      { name: 'Packaging', code: 'PACK', description: 'Packaging materials and supplies' },
      { name: 'Medical Supplies', code: 'MEDS', description: 'Medical equipment and supplies' },
      { name: 'Office Supplies', code: 'OFFC', description: 'Office stationery and equipment' },
    ]);
    console.log(`Created ${categories.length} categories.`);

    // --- SUPPLIERS ---
    const suppliers = await Supplier.create([
      { name: 'TechCorp India', code: 'SUP-TC', contactPerson: 'Vikram Mehta', email: 'vikram@techcorp.in', phone: '+91-9900112233', address: { city: 'Pune', state: 'Maharashtra' }, rating: 4.5, leadTimeDays: 5, paymentTerms: 'Net 30' },
      { name: 'Global Materials Ltd', code: 'SUP-GM', contactPerson: 'Anita Rao', email: 'anita@globalmaterials.com', phone: '+91-9900445566', address: { city: 'Chennai', state: 'Tamil Nadu' }, rating: 4.0, leadTimeDays: 7, paymentTerms: 'Net 45' },
      { name: 'FastTrack Logistics', code: 'SUP-FT', contactPerson: 'Rahul Jain', email: 'rahul@fasttrack.in', phone: '+91-9900778899', address: { city: 'Ahmedabad', state: 'Gujarat' }, rating: 3.8, leadTimeDays: 3, paymentTerms: 'Net 15' },
      { name: 'Prime Packaging Co', code: 'SUP-PP', contactPerson: 'Deepa Nair', email: 'deepa@primepack.com', phone: '+91-9901122334', address: { city: 'Hyderabad', state: 'Telangana' }, rating: 4.2, leadTimeDays: 4, paymentTerms: 'Net 30' },
      { name: 'MedSupply India', code: 'SUP-MS', contactPerson: 'Dr. Suresh', email: 'suresh@medsupply.in', phone: '+91-9901234567', address: { city: 'Delhi', state: 'Delhi' }, rating: 4.7, leadTimeDays: 2, paymentTerms: 'Net 15' },
    ]);
    console.log(`Created ${suppliers.length} suppliers.`);

    // --- PRODUCTS ---
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const makeDemandHistory = (base, variance) => {
      return monthNames.slice(0, 6).map((m, i) => ({
        month: m, year: 2026, quantity: Math.max(0, base + Math.floor(Math.random() * variance * 2 - variance)),
      }));
    };

    const futureDate = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };

    const products = await Product.create([
      { sku: 'ELEC-LAP-001', name: 'Business Laptop Pro 15"', category: categories[0]._id, supplier: suppliers[0]._id, costPrice: 45000, sellingPrice: 62000, reorderLevel: 20, reorderQuantity: 50, maxStockThreshold: 200, leadTimeDays: 5, unitOfMeasure: 'pcs', barcode: '8901234567890', description: 'High-performance business laptop with 16GB RAM', demandHistory: makeDemandHistory(30, 10), status: 'active' },
      { sku: 'ELEC-MON-002', name: 'LED Monitor 24" FHD', category: categories[0]._id, supplier: suppliers[0]._id, costPrice: 12000, sellingPrice: 16500, reorderLevel: 30, reorderQuantity: 100, maxStockThreshold: 400, leadTimeDays: 4, unitOfMeasure: 'pcs', barcode: '8901234567891', description: '24 inch Full HD LED monitor', demandHistory: makeDemandHistory(50, 15), status: 'active' },
      { sku: 'FMCG-SOP-003', name: 'Premium Hand Sanitizer 500ml', category: categories[1]._id, supplier: suppliers[2]._id, costPrice: 120, sellingPrice: 199, reorderLevel: 500, reorderQuantity: 2000, maxStockThreshold: 8000, expiryDate: futureDate(180), leadTimeDays: 3, unitOfMeasure: 'pcs', barcode: '8901234567892', description: 'Alcohol-based hand sanitizer', demandHistory: makeDemandHistory(200, 50), status: 'active' },
      { sku: 'FMCG-CLN-004', name: 'Industrial Floor Cleaner 5L', category: categories[1]._id, supplier: suppliers[2]._id, costPrice: 350, sellingPrice: 520, reorderLevel: 200, reorderQuantity: 500, maxStockThreshold: 2000, expiryDate: futureDate(365), leadTimeDays: 3, unitOfMeasure: 'pcs', barcode: '8901234567893', description: 'Heavy duty industrial floor cleaner', demandHistory: makeDemandHistory(100, 30), status: 'active' },
      { sku: 'INDU-MOT-005', name: 'Electric Motor 5HP', category: categories[2]._id, supplier: suppliers[1]._id, costPrice: 28000, sellingPrice: 38000, reorderLevel: 5, reorderQuantity: 15, maxStockThreshold: 50, leadTimeDays: 10, unitOfMeasure: 'pcs', barcode: '8901234567894', description: '5 horsepower industrial electric motor', demandHistory: makeDemandHistory(8, 3), status: 'active' },
      { sku: 'RAWM-STL-006', name: 'Stainless Steel Sheet 4x8ft', category: categories[3]._id, supplier: suppliers[1]._id, costPrice: 8500, sellingPrice: 11000, reorderLevel: 50, reorderQuantity: 200, maxStockThreshold: 800, leadTimeDays: 7, unitOfMeasure: 'pcs', barcode: '8901234567895', description: 'Grade 304 stainless steel sheet', demandHistory: makeDemandHistory(40, 15), status: 'active' },
      { sku: 'AUTO-BRK-007', name: 'Brake Pad Set - Universal', category: categories[4]._id, supplier: suppliers[1]._id, costPrice: 1200, sellingPrice: 1800, reorderLevel: 100, reorderQuantity: 300, maxStockThreshold: 1000, leadTimeDays: 5, unitOfMeasure: 'pcs', barcode: '8901234567896', description: 'Universal brake pad set for sedans', demandHistory: makeDemandHistory(60, 20), status: 'active' },
      { sku: 'PACK-BOX-008', name: 'Corrugated Box 12x12x12"', category: categories[5]._id, supplier: suppliers[3]._id, costPrice: 45, sellingPrice: 75, reorderLevel: 1000, reorderQuantity: 5000, maxStockThreshold: 20000, leadTimeDays: 2, unitOfMeasure: 'pcs', barcode: '8901234567897', description: 'Standard corrugated shipping box', demandHistory: makeDemandHistory(500, 100), status: 'active' },
      { sku: 'MEDS-MSK-009', name: 'N95 Face Mask (Box of 50)', category: categories[6]._id, supplier: suppliers[4]._id, costPrice: 800, sellingPrice: 1200, reorderLevel: 100, reorderQuantity: 500, maxStockThreshold: 2000, expiryDate: futureDate(730), leadTimeDays: 2, unitOfMeasure: 'box', barcode: '8901234567898', description: 'Medical grade N95 face masks', demandHistory: makeDemandHistory(80, 25), status: 'active' },
      { sku: 'OFFC-PPR-010', name: 'A4 Copier Paper (500 sheets)', category: categories[7]._id, supplier: suppliers[3]._id, costPrice: 280, sellingPrice: 400, reorderLevel: 200, reorderQuantity: 1000, maxStockThreshold: 5000, leadTimeDays: 3, unitOfMeasure: 'pack', barcode: '8901234567899', description: 'Premium white A4 copier paper', demandHistory: makeDemandHistory(150, 40), status: 'active' },
      { sku: 'ELEC-KBD-011', name: 'Mechanical Keyboard RGB', category: categories[0]._id, supplier: suppliers[0]._id, costPrice: 3500, sellingPrice: 5200, reorderLevel: 40, reorderQuantity: 100, maxStockThreshold: 300, leadTimeDays: 5, unitOfMeasure: 'pcs', barcode: '8901234567900', description: 'RGB mechanical keyboard with Cherry MX switches', demandHistory: makeDemandHistory(25, 8), status: 'active' },
      { sku: 'FMCG-TIS-012', name: 'Tissue Paper Roll (Pack of 6)', category: categories[1]._id, supplier: suppliers[2]._id, costPrice: 150, sellingPrice: 250, reorderLevel: 300, reorderQuantity: 1000, maxStockThreshold: 5000, expiryDate: futureDate(25), leadTimeDays: 2, unitOfMeasure: 'pack', barcode: '8901234567901', description: 'Soft tissue paper rolls', demandHistory: makeDemandHistory(180, 40), status: 'active' },
      { sku: 'RAWM-CPR-013', name: 'Copper Wire Spool 100m', category: categories[3]._id, supplier: suppliers[1]._id, costPrice: 5200, sellingPrice: 7000, reorderLevel: 25, reorderQuantity: 80, maxStockThreshold: 300, leadTimeDays: 8, unitOfMeasure: 'pcs', barcode: '8901234567902', description: 'High-grade copper wire for electrical applications', demandHistory: makeDemandHistory(15, 5), status: 'active' },
      { sku: 'AUTO-OIL-014', name: 'Engine Oil 5W-30 (4L)', category: categories[4]._id, supplier: suppliers[2]._id, costPrice: 1800, sellingPrice: 2500, reorderLevel: 80, reorderQuantity: 200, maxStockThreshold: 600, expiryDate: futureDate(540), leadTimeDays: 4, unitOfMeasure: 'pcs', barcode: '8901234567903', description: 'Synthetic engine oil 5W-30', demandHistory: makeDemandHistory(45, 15), status: 'active' },
      { sku: 'MEDS-GLV-015', name: 'Nitrile Gloves (Box of 100)', category: categories[6]._id, supplier: suppliers[4]._id, costPrice: 600, sellingPrice: 950, reorderLevel: 150, reorderQuantity: 500, maxStockThreshold: 2500, expiryDate: futureDate(900), leadTimeDays: 2, unitOfMeasure: 'box', barcode: '8901234567904', description: 'Disposable nitrile examination gloves', demandHistory: makeDemandHistory(90, 30), status: 'active' },
    ]);
    console.log(`Created ${products.length} products.`);

    // --- INVENTORY ---
    const inventoryData = [];
    const statuses = (qty, prod) => {
      if (qty === 0) return 'out-of-stock';
      if (qty <= prod.reorderLevel) return 'low-stock';
      if (qty > prod.maxStockThreshold) return 'overstock';
      return 'in-stock';
    };

    // Distribute products across warehouses
    const quantities = [
      [45, 120, 1500, 800, 12, 180, 250, 5000, 300, 600, 70, 800, 50, 150, 400],
      [30, 80, 900, 400, 8, 100, 180, 3000, 200, 400, 45, 500, 30, 100, 250],
      [15, 50, 600, 200, 3, 60, 100, 2000, 150, 300, 30, 250, 20, 60, 180],
    ];

    for (let w = 0; w < warehouses.length; w++) {
      for (let p = 0; p < products.length; p++) {
        const qty = quantities[w][p];
        inventoryData.push({
          product: products[p]._id,
          warehouse: warehouses[w]._id,
          zone: zones[w * 2]._id,
          quantity: qty,
          costPrice: products[p].costPrice,
          expiryDate: products[p].expiryDate || null,
          lastRestockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          lastMovementAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          status: statuses(qty, products[p]),
        });
      }
    }

    // Add some low/out-of-stock items
    inventoryData[2].quantity = 3; // Tissue paper near expiry item
    inventoryData[2].status = 'low-stock';
    inventoryData[4].quantity = 2; // Electric motor low stock
    inventoryData[4].status = 'low-stock';

    const inventory = await Inventory.insertMany(inventoryData);
    console.log(`Created ${inventory.length} inventory records.`);

    // --- STOCK TRANSACTIONS ---
    const txnTypes = ['inward', 'outward', 'inward', 'outward', 'transfer', 'inward', 'outward', 'adjustment', 'return', 'outward'];
    const txns = [];
    for (let i = 0; i < 30; i++) {
      const type = txnTypes[i % txnTypes.length];
      const product = products[i % products.length];
      const qty = Math.floor(Math.random() * 50) + 5;
      const daysAgo = Math.floor(Math.random() * 60);
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      txns.push({
        referenceNumber: `${type.substring(0, 3).toUpperCase()}-SEED-${String(i + 1).padStart(4, '0')}`,
        type,
        product: product._id,
        quantity: qty,
        previousQuantity: qty + Math.floor(Math.random() * 100),
        newQuantity: qty + Math.floor(Math.random() * 50),
        sourceWarehouse: type === 'outward' || type === 'transfer' ? warehouses[i % 3]._id : undefined,
        destinationWarehouse: type === 'inward' || type === 'transfer' || type === 'return' ? warehouses[(i + 1) % 3]._id : undefined,
        unitCost: product.costPrice,
        totalCost: product.costPrice * qty,
        performedBy: users[i % users.length]._id,
        status: 'completed',
        remarks: `Seed transaction #${i + 1}`,
        createdAt: date,
        updatedAt: date,
      });
    }
    await StockTransaction.insertMany(txns);
    console.log(`Created ${txns.length} stock transactions.`);

    // --- ALERTS ---
    const alerts = await Alert.create([
      { type: 'low-stock', severity: 'warning', title: 'Low Stock: Electric Motor 5HP', message: 'Electric Motor has only 2 units in Mumbai warehouse. Reorder level: 5', product: products[4]._id, warehouse: warehouses[0]._id },
      { type: 'near-expiry', severity: 'critical', title: 'Near Expiry: Tissue Paper Roll', message: 'Tissue Paper Roll expires in 25 days. 800 units at risk.', product: products[11]._id, warehouse: warehouses[0]._id, metadata: { daysUntilExpiry: 25 } },
      { type: 'overstock', severity: 'info', title: 'Overstock: Corrugated Box', message: 'Corrugated Box has 5000 units, exceeding max threshold of 3000.', product: products[7]._id, warehouse: warehouses[0]._id },
      { type: 'out-of-stock', severity: 'critical', title: 'Out of Stock: LED Monitor in Bangalore', message: 'LED Monitor is out of stock in Bangalore warehouse.', product: products[1]._id, warehouse: warehouses[2]._id, isRead: true },
      { type: 'reorder-threshold', severity: 'warning', title: 'Reorder: Brake Pad Set', message: 'Brake Pad Set has reached reorder level. Consider placing order.', product: products[6]._id, warehouse: warehouses[1]._id },
      { type: 'abnormal-movement', severity: 'warning', title: 'Unusual Outbound: Hand Sanitizer', message: 'Unusually high outbound movement detected for Hand Sanitizer.', product: products[2]._id, warehouse: warehouses[0]._id },
    ]);
    console.log(`Created ${alerts.length} alerts.`);

    // --- AUDIT LOGS ---
    await AuditLog.create([
      { action: 'login', entity: 'user', entityId: users[0]._id, user: users[0]._id, description: 'Admin logged in' },
      { action: 'create', entity: 'product', entityId: products[0]._id, user: users[0]._id, description: 'Created product: Business Laptop Pro 15"' },
      { action: 'stock-inward', entity: 'transaction', user: users[1]._id, description: 'Stock inward: 50 x LED Monitor' },
      { action: 'stock-outward', entity: 'transaction', user: users[3]._id, description: 'Stock outward: 20 x Hand Sanitizer' },
      { action: 'update', entity: 'warehouse', entityId: warehouses[0]._id, user: users[0]._id, description: 'Updated Mumbai Central Warehouse capacity' },
    ]);
    console.log('Created audit logs.');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n--- Login Credentials ---');
    console.log('Admin:   admin@warehouse.com / admin123');
    console.log('Manager: manager@warehouse.com / manager123');
    console.log('Staff:   staff@warehouse.com / staff123');
    console.log('-------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
