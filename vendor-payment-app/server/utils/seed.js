const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vendor_payment_db');
  console.log('DB connected for seeding');
};

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([User.deleteMany(), Vendor.deleteMany(), Invoice.deleteMany(), Payment.deleteMany()]);
  console.log('Cleared existing data');

  // Users
  const users = await User.create([
    { name: 'Admin User', email: 'admin@company.com', password: 'Admin@123', role: 'admin' },
    { name: 'Priya Sharma', email: 'priya@company.com', password: 'Account@123', role: 'accountant' },
    { name: 'Ravi Kumar', email: 'ravi@company.com', password: 'Viewer@123', role: 'viewer' },
  ]);
  console.log('Users seeded');

  const admin = users[0];

  // Vendors
  const vendors = await Vendor.create([
    {
      vendorName: 'TechSoft Solutions Pvt Ltd',
      vendorCode: 'VS001',
      contactPerson: 'Anand Mehta',
      email: 'anand@techsoft.in',
      phone: '+91-9876543210',
      address: { street: '12 MG Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', zipCode: '560001' },
      taxId: 'GSTIN27AAACT2727Q1ZW',
      bankDetails: { bankName: 'HDFC Bank', accountNumber: '50100112233445', ifscCode: 'HDFC0001234', accountHolder: 'TechSoft Solutions' },
      paymentTerms: 'Net 30',
      currency: 'INR',
      status: 'active',
      createdBy: admin._id,
    },
    {
      vendorName: 'CloudBase Infrastructure',
      vendorCode: 'CBI002',
      contactPerson: 'Meena Rajan',
      email: 'meena@cloudbase.io',
      phone: '+91-9123456789',
      address: { street: '45 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', country: 'India', zipCode: '600002' },
      taxId: 'GSTIN33AACCB7832M1ZV',
      bankDetails: { bankName: 'ICICI Bank', accountNumber: '001601523902', ifscCode: 'ICIC0000016', accountHolder: 'CloudBase Infrastructure' },
      paymentTerms: 'Net 45',
      currency: 'INR',
      status: 'active',
      createdBy: admin._id,
    },
    {
      vendorName: 'Office Supplies Co.',
      vendorCode: 'OSC003',
      contactPerson: 'Vijay Patel',
      email: 'vijay@officesupplies.in',
      phone: '+91-9988776655',
      address: { street: '7 Park Street', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400001' },
      taxId: 'GSTIN27AAACO4445P1ZX',
      paymentTerms: 'Net 15',
      currency: 'INR',
      status: 'active',
      createdBy: admin._id,
    },
    {
      vendorName: 'Global Freight Logistics',
      vendorCode: 'GFL004',
      contactPerson: 'Sunita Nair',
      email: 'sunita@globalfreight.com',
      phone: '+91-9765432109',
      address: { street: '22 Nehru Place', city: 'New Delhi', state: 'Delhi', country: 'India', zipCode: '110019' },
      taxId: 'GSTIN07AAACG6678K1ZY',
      paymentTerms: 'Net 60',
      currency: 'INR',
      status: 'inactive',
      createdBy: admin._id,
    },
  ]);
  console.log('Vendors seeded');

  const past = (days) => new Date(Date.now() - days * 86400000);
  const future = (days) => new Date(Date.now() + days * 86400000);

  // Invoices
  const invoices = await Invoice.create([
    {
      invoiceNumber: 'INV-2024-001',
      vendor: vendors[0]._id,
      invoiceDate: past(60),
      dueDate: past(30),
      amount: 85000,
      taxAmount: 15300,
      totalAmount: 100300,
      paidAmount: 100300,
      currency: 'INR',
      category: 'Software',
      description: 'Annual software license renewal for ERP suite',
      status: 'Paid',
      createdBy: admin._id,
      approvedBy: admin._id,
    },
    {
      invoiceNumber: 'INV-2024-002',
      vendor: vendors[1]._id,
      invoiceDate: past(45),
      dueDate: past(15),
      amount: 42000,
      taxAmount: 7560,
      totalAmount: 49560,
      paidAmount: 25000,
      currency: 'INR',
      category: 'Services',
      description: 'Cloud hosting and managed services - Q4 2024',
      status: 'Partially Paid',
      createdBy: users[1]._id,
      approvedBy: admin._id,
    },
    {
      invoiceNumber: 'INV-2024-003',
      vendor: vendors[2]._id,
      invoiceDate: past(10),
      dueDate: future(5),
      amount: 12000,
      taxAmount: 2160,
      totalAmount: 14160,
      paidAmount: 0,
      currency: 'INR',
      category: 'Goods',
      description: 'Office stationery and supplies - Nov 2024',
      status: 'Approved',
      createdBy: users[1]._id,
      approvedBy: admin._id,
    },
    {
      invoiceNumber: 'INV-2024-004',
      vendor: vendors[0]._id,
      invoiceDate: past(5),
      dueDate: future(25),
      amount: 65000,
      taxAmount: 11700,
      totalAmount: 76700,
      paidAmount: 0,
      currency: 'INR',
      category: 'Consulting',
      description: 'IT infrastructure consulting - Phase 1',
      status: 'Submitted',
      createdBy: users[1]._id,
    },
    {
      invoiceNumber: 'INV-2024-005',
      vendor: vendors[1]._id,
      invoiceDate: past(90),
      dueDate: past(60),
      amount: 35000,
      taxAmount: 6300,
      totalAmount: 41300,
      paidAmount: 0,
      currency: 'INR',
      category: 'Services',
      description: 'Data migration and backup services',
      status: 'Overdue',
      createdBy: users[1]._id,
      approvedBy: admin._id,
    },
    {
      invoiceNumber: 'INV-2024-006',
      vendor: vendors[2]._id,
      invoiceDate: past(2),
      dueDate: future(13),
      amount: 8500,
      taxAmount: 1530,
      totalAmount: 10030,
      paidAmount: 0,
      currency: 'INR',
      category: 'Goods',
      description: 'Printer cartridges and toner refill',
      status: 'Draft',
      createdBy: users[1]._id,
    },
  ]);
  console.log('Invoices seeded');

  // Payments
  await Payment.create([
    {
      paymentRef: 'PAY-2024-001',
      vendor: vendors[0]._id,
      invoice: invoices[0]._id,
      paymentDate: past(28),
      paidAmount: 100300,
      paymentMode: 'Bank Transfer',
      transactionId: 'TXN9876543210',
      notes: 'Full payment via RTGS',
      status: 'Completed',
      createdBy: admin._id,
    },
    {
      paymentRef: 'PAY-2024-002',
      vendor: vendors[1]._id,
      invoice: invoices[1]._id,
      paymentDate: past(10),
      paidAmount: 25000,
      paymentMode: 'UPI',
      transactionId: 'UPI20241112001',
      notes: 'Partial payment - remaining to follow',
      status: 'Completed',
      createdBy: users[1]._id,
    },
  ]);
  console.log('Payments seeded');

  console.log('\n✅ Seed complete!');
  console.log('Login credentials:');
  console.log('  Admin     → admin@company.com   / Admin@123');
  console.log('  Accountant→ priya@company.com   / Account@123');
  console.log('  Viewer    → ravi@company.com    / Viewer@123');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
