const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const FollowUp = require("../models/FollowUp");
const Activity = require("../models/Activity");

const isPrivileged = (role) => ["admin", "manager"].includes(role);

const getLeadFilter = (user) => {
  if (isPrivileged(user.role)) {
    return {};
  }

  return {
    $or: [{ assignedTo: user._id }, { createdBy: user._id }]
  };
};

const getSummary = asyncHandler(async (req, res) => {
  const leadFilter = getLeadFilter(req.user);
  const customerFilter = isPrivileged(req.user.role) ? {} : { accountManager: req.user._id };
  const followUpFilter = isPrivileged(req.user.role) ? {} : { assignedTo: req.user._id };
  const activityFilter = isPrivileged(req.user.role) ? {} : { actor: req.user._id };

  const now = new Date();
  const in7Days = new Date();
  in7Days.setDate(now.getDate() + 7);

  const [
    totalLeads,
    wonLeads,
    lostLeads,
    customers,
    upcomingFollowUps,
    statusBuckets,
    latestActivities,
    totalPipelineValue
  ] = await Promise.all([
    Lead.countDocuments(leadFilter),
    Lead.countDocuments({ ...leadFilter, status: "WON" }),
    Lead.countDocuments({ ...leadFilter, status: "LOST" }),
    Customer.countDocuments(customerFilter),
    FollowUp.countDocuments({
      ...followUpFilter,
      status: "PENDING",
      dueDate: { $gte: now, $lte: in7Days }
    }),
    Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Activity.find(activityFilter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(10),
    Lead.aggregate([
      { $match: { ...leadFilter, status: { $in: ["QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON"] } } },
      { $group: { _id: null, total: { $sum: "$estimatedValue" } } }
    ])
  ]);

  const conversionRate = totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(2)) : 0;
  const statusBreakdown = statusBuckets.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.json({
    summary: {
      totalLeads,
      wonLeads,
      lostLeads,
      customers,
      upcomingFollowUps,
      conversionRate,
      totalPipelineValue: totalPipelineValue[0]?.total || 0,
      statusBreakdown
    },
    latestActivities
  });
});

const getConversionReport = asyncHandler(async (req, res) => {
  const leadFilter = getLeadFilter(req.user);

  const matchStage = { ...leadFilter, convertedAt: { $ne: null } };
  if (!isPrivileged(req.user.role)) {
    matchStage.$or = [{ assignedTo: new mongoose.Types.ObjectId(req.user._id) }, { createdBy: new mongoose.Types.ObjectId(req.user._id) }];
  }

  const [monthlyConversions, executivePerformance] = await Promise.all([
    Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$convertedAt" },
            month: { $month: "$convertedAt" }
          },
          totalConverted: { $sum: 1 },
          totalValue: { $sum: "$estimatedValue" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),
    Lead.aggregate([
      { $match: leadFilter },
      {
        $group: {
          _id: "$assignedTo",
          totalLeads: { $sum: 1 },
          wonLeads: {
            $sum: {
              $cond: [{ $eq: ["$status", "WON"] }, 1, 0]
            }
          },
          pipelineValue: { $sum: "$estimatedValue" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          totalLeads: 1,
          wonLeads: 1,
          pipelineValue: 1,
          conversionRate: {
            $cond: [
              { $eq: ["$totalLeads", 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: ["$wonLeads", "$totalLeads"]
                  },
                  100
                ]
              }
            ]
          }
        }
      },
      { $sort: { pipelineValue: -1 } }
    ])
  ]);

  res.json({
    monthlyConversions,
    executivePerformance
  });
});

const getActivityFeed = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit || 30);
  const query = isPrivileged(req.user.role) ? {} : { actor: req.user._id };

  const activities = await Activity.find(query)
    .populate("actor", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ activities });
});

module.exports = {
  getSummary,
  getConversionReport,
  getActivityFeed
};
