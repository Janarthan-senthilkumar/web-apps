const asyncHandler = require("express-async-handler");

const FollowUp = require("../models/FollowUp");
const Lead = require("../models/Lead");
const { createActivity } = require("../services/activityService");

const isPrivileged = (role) => ["admin", "manager"].includes(role);

const scheduleFollowUp = asyncHandler(async (req, res) => {
  const { leadId, assignedTo, dueDate, type, notes } = req.body;

  if (!leadId || !dueDate) {
    res.status(400);
    throw new Error("leadId and dueDate are required.");
  }

  const lead = await Lead.findById(leadId);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found.");
  }

  const leadAssignedId = lead.assignedTo ? lead.assignedTo.toString() : null;
  if (!isPrivileged(req.user.role) && leadAssignedId !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the assigned executive can schedule follow-ups for this lead.");
  }

  let finalAssignee = assignedTo || lead.assignedTo || req.user._id;
  if (!isPrivileged(req.user.role) && finalAssignee.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Executives can only assign follow-ups to themselves.");
  }

  const followUp = await FollowUp.create({
    lead: lead._id,
    assignedTo: finalAssignee,
    dueDate,
    type,
    notes,
    createdBy: req.user._id
  });

  lead.nextFollowUpDate = new Date(dueDate);
  await lead.save();

  await createActivity({
    action: "SCHEDULE_FOLLOWUP",
    entityType: "followup",
    entityId: followUp._id,
    actor: req.user._id,
    metadata: { leadId: lead._id.toString() }
  });

  const populated = await FollowUp.findById(followUp._id)
    .populate("lead", "fullName email phone company status")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  res.status(201).json({ followUp: populated });
});

const getFollowUps = asyncHandler(async (req, res) => {
  const query = {};

  if (!isPrivileged(req.user.role)) {
    query.assignedTo = req.user._id;
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.dateFrom || req.query.dateTo) {
    query.dueDate = {};
    if (req.query.dateFrom) {
      query.dueDate.$gte = new Date(req.query.dateFrom);
    }
    if (req.query.dateTo) {
      query.dueDate.$lte = new Date(req.query.dateTo);
    }
  }

  const followUps = await FollowUp.find(query)
    .populate("lead", "fullName email phone company status")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ dueDate: 1 });

  res.json({ followUps });
});

const completeFollowUp = asyncHandler(async (req, res) => {
  const { outcome } = req.body;

  const followUp = await FollowUp.findById(req.params.id).populate("lead");

  if (!followUp) {
    res.status(404);
    throw new Error("Follow-up not found.");
  }

  if (!isPrivileged(req.user.role) && followUp.assignedTo.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Forbidden.");
  }

  followUp.status = "COMPLETED";
  followUp.completedAt = new Date();
  followUp.outcome = outcome || "Completed";
  await followUp.save();

  const lead = await Lead.findById(followUp.lead._id);
  if (lead) {
    lead.lastFollowUpAt = new Date();

    const nextPending = await FollowUp.findOne({
      lead: lead._id,
      status: "PENDING"
    }).sort({ dueDate: 1 });

    lead.nextFollowUpDate = nextPending ? nextPending.dueDate : null;
    await lead.save();
  }

  await createActivity({
    action: "COMPLETE_FOLLOWUP",
    entityType: "followup",
    entityId: followUp._id,
    actor: req.user._id,
    metadata: { outcome: followUp.outcome }
  });

  const populated = await FollowUp.findById(followUp._id)
    .populate("lead", "fullName email company status")
    .populate("assignedTo", "name email role");

  res.json({ followUp: populated });
});

module.exports = {
  scheduleFollowUp,
  getFollowUps,
  completeFollowUp
};
