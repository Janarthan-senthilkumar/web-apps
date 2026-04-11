const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const { LEAD_STATUSES } = require("../utils/constants");
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

const canAccessLead = (user, lead) => {
  if (isPrivileged(user.role)) {
    return true;
  }

  const userId = user._id.toString();
  const assigned = getObjectIdString(lead.assignedTo);
  const creator = getObjectIdString(lead.createdBy);

  return assigned === userId || creator === userId;
};

const buildLeadQuery = (user, queryParams = {}) => {
  const query = {};

  if (!isPrivileged(user.role)) {
    query.$or = [{ assignedTo: user._id }, { createdBy: user._id }];
  }

  if (queryParams.status) {
    query.status = queryParams.status;
  }

  if (queryParams.assignedTo && isPrivileged(user.role)) {
    query.assignedTo = queryParams.assignedTo;
  }

  if (queryParams.search) {
    query.$text = { $search: queryParams.search };
  }

  return query;
};

const getLeads = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  const query = buildLeadQuery(req.user, req.query);

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("convertedCustomer", "fullName company")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Lead.countDocuments(query)
  ]);

  res.json({
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

const createLead = asyncHandler(async (req, res) => {
  const { fullName, email, phone, company, source, estimatedValue, notes, tags, assignedTo } = req.body;

  if (!fullName) {
    res.status(400);
    throw new Error("Lead fullName is required.");
  }

  let finalAssignedTo = assignedTo || null;

  if (!isPrivileged(req.user.role)) {
    if (assignedTo && assignedTo !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Executives can only assign leads to themselves.");
    }

    finalAssignedTo = req.user._id;
  }

  const lead = await Lead.create({
    fullName,
    email,
    phone,
    company,
    source,
    estimatedValue,
    notes,
    tags,
    assignedTo: finalAssignedTo,
    createdBy: req.user._id
  });

  await createActivity({
    action: "CREATE_LEAD",
    entityType: "lead",
    entityId: lead._id,
    actor: req.user._id,
    metadata: { status: lead.status }
  });

  const populatedLead = await Lead.findById(lead._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  res.status(201).json({ lead: populatedLead });
});

const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("convertedCustomer", "fullName company");

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found.");
  }

  if (!canAccessLead(req.user, lead)) {
    res.status(403);
    throw new Error("Forbidden.");
  }

  res.json({ lead });
});

const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found.");
  }

  if (!canAccessLead(req.user, lead)) {
    res.status(403);
    throw new Error("Forbidden.");
  }

  const updatableFields = ["fullName", "email", "phone", "company", "source", "estimatedValue", "notes", "tags"];
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      lead[field] = req.body[field];
    }
  });

  await lead.save();

  await createActivity({
    action: "UPDATE_LEAD",
    entityType: "lead",
    entityId: lead._id,
    actor: req.user._id
  });

  const populatedLead = await Lead.findById(lead._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("convertedCustomer", "fullName company");

  res.json({ lead: populatedLead });
});

const assignLead = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;

  if (!assignedTo || !mongoose.Types.ObjectId.isValid(assignedTo)) {
    res.status(400);
    throw new Error("A valid assignedTo user id is required.");
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found.");
  }

  lead.assignedTo = assignedTo;
  await lead.save();

  await createActivity({
    action: "ASSIGN_LEAD",
    entityType: "lead",
    entityId: lead._id,
    actor: req.user._id,
    metadata: { assignedTo }
  });

  const populatedLead = await Lead.findById(lead._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  res.json({ lead: populatedLead });
});

const updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !LEAD_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("A valid lead status is required.");
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found.");
  }

  if (!canAccessLead(req.user, lead)) {
    res.status(403);
    throw new Error("Forbidden.");
  }

  lead.status = status;
  if (status === "WON" && !lead.convertedAt) {
    lead.convertedAt = new Date();
  }

  await lead.save();

  await createActivity({
    action: "UPDATE_LEAD_STATUS",
    entityType: "lead",
    entityId: lead._id,
    actor: req.user._id,
    metadata: { status }
  });

  res.json({ lead });
});

const convertLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found.");
  }

  if (!canAccessLead(req.user, lead)) {
    res.status(403);
    throw new Error("Forbidden.");
  }

  if (lead.convertedCustomer) {
    const existingCustomer = await Customer.findById(lead.convertedCustomer);
    res.json({ customer: existingCustomer, lead });
    return;
  }

  const customer = await Customer.create({
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    leadRef: lead._id,
    accountManager: lead.assignedTo || req.user._id,
    value: lead.estimatedValue,
    stage: "Onboarding",
    interactions: []
  });

  lead.status = "WON";
  lead.convertedAt = lead.convertedAt || new Date();
  lead.convertedCustomer = customer._id;
  await lead.save();

  await createActivity({
    action: "CONVERT_LEAD",
    entityType: "lead",
    entityId: lead._id,
    actor: req.user._id,
    metadata: { customerId: customer._id.toString() }
  });

  res.json({ customer, lead });
});

const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found.");
  }

  await lead.deleteOne();

  await createActivity({
    action: "DELETE_LEAD",
    entityType: "lead",
    entityId: lead._id,
    actor: req.user._id
  });

  res.json({ message: "Lead deleted successfully." });
});

module.exports = {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  assignLead,
  updateLeadStatus,
  convertLead,
  deleteLead
};

