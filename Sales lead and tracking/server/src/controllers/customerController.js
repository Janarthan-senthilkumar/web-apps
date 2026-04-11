const asyncHandler = require("express-async-handler");

const Customer = require("../models/Customer");
const { createActivity } = require("../services/activityService");

const isPrivileged = (role) => ["admin", "manager"].includes(role);

const getObjectIdString = (value) => {
  if (!value) {
    return null;
  }

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
};

const canAccessCustomer = (user, customer) => {
  if (isPrivileged(user.role)) {
    return true;
  }

  return getObjectIdString(customer.accountManager) === user._id.toString();
};

const getCustomers = asyncHandler(async (req, res) => {
  const query = {};

  if (!isPrivileged(req.user.role)) {
    query.accountManager = req.user._id;
  }

  if (req.query.search) {
    query.$or = [
      { fullName: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
      { company: { $regex: req.query.search, $options: "i" } }
    ];
  }

  if (req.query.stage) {
    query.stage = req.query.stage;
  }

  const customers = await Customer.find(query)
    .populate("accountManager", "name email role")
    .populate("leadRef", "fullName status")
    .populate("interactions.createdBy", "name email role")
    .sort({ updatedAt: -1 });

  res.json({ customers });
});

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
    .populate("accountManager", "name email role")
    .populate("leadRef", "fullName status")
    .populate("interactions.createdBy", "name email role");

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found.");
  }

  if (!canAccessCustomer(req.user, customer)) {
    res.status(403);
    throw new Error("Forbidden.");
  }

  res.json({ customer });
});

const createCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, phone, company, accountManager, value, stage } = req.body;

  if (!fullName) {
    res.status(400);
    throw new Error("Customer fullName is required.");
  }

  const customer = await Customer.create({
    fullName,
    email,
    phone,
    company,
    accountManager: accountManager || req.user._id,
    value,
    stage,
    interactions: []
  });

  await createActivity({
    action: "CREATE_CUSTOMER",
    entityType: "customer",
    entityId: customer._id,
    actor: req.user._id
  });

  const populated = await Customer.findById(customer._id).populate("accountManager", "name email role");
  res.status(201).json({ customer: populated });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found.");
  }

  if (!canAccessCustomer(req.user, customer)) {
    res.status(403);
    throw new Error("Forbidden.");
  }

  const updatableFields = ["fullName", "email", "phone", "company", "value", "stage", "accountManager"];
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      customer[field] = req.body[field];
    }
  });

  await customer.save();

  await createActivity({
    action: "UPDATE_CUSTOMER",
    entityType: "customer",
    entityId: customer._id,
    actor: req.user._id
  });

  const populated = await Customer.findById(customer._id)
    .populate("accountManager", "name email role")
    .populate("interactions.createdBy", "name email role");

  res.json({ customer: populated });
});

const addInteraction = asyncHandler(async (req, res) => {
  const { interactionType, summary } = req.body;

  if (!summary) {
    res.status(400);
    throw new Error("Interaction summary is required.");
  }

  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found.");
  }

  if (!canAccessCustomer(req.user, customer)) {
    res.status(403);
    throw new Error("Forbidden.");
  }

  customer.interactions.push({
    interactionType,
    summary,
    createdBy: req.user._id
  });

  await customer.save();

  await createActivity({
    action: "ADD_INTERACTION",
    entityType: "customer",
    entityId: customer._id,
    actor: req.user._id,
    metadata: { interactionType: interactionType || "NOTE" }
  });

  const populated = await Customer.findById(customer._id).populate("interactions.createdBy", "name email role");
  res.json({ customer: populated });
});

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addInteraction
};

