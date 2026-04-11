const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");
const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const FollowUp = require("../models/FollowUp");
const Activity = require("../models/Activity");

const DEMO_PASSWORD = "Demo@123";

const userSeeds = [
  {
    key: "admin",
    name: "Aarav Mehta",
    email: "admin@demo.crm",
    password: DEMO_PASSWORD,
    role: "admin"
  },
  {
    key: "manager",
    name: "Maya Rodriguez",
    email: "manager@demo.crm",
    password: DEMO_PASSWORD,
    role: "manager"
  },
  {
    key: "executive",
    name: "Jordan Lee",
    email: "executive@demo.crm",
    password: DEMO_PASSWORD,
    role: "executive"
  }
];

const leadSeeds = [
  {
    key: "acme-qualification",
    fullName: "Ava Thompson",
    email: "ava.thompson@acme.example",
    phone: "+1-202-555-0142",
    company: "Acme Logistics",
    source: "Website",
    estimatedValue: 24000,
    status: "QUALIFIED",
    assignedTo: "executive",
    createdBy: "manager",
    notes: "Wants rollout for two sales teams before quarter end.",
    tags: ["enterprise", "priority-a"]
  },
  {
    key: "northwind-proposal",
    fullName: "Noah Patel",
    email: "noah.patel@northwind.example",
    phone: "+1-202-555-0161",
    company: "Northwind Traders",
    source: "Referral",
    estimatedValue: 18000,
    status: "PROPOSAL",
    assignedTo: "executive",
    createdBy: "manager",
    notes: "Proposal shared. Waiting for procurement review.",
    tags: ["mid-market"]
  },
  {
    key: "globex-negotiation",
    fullName: "Leah Johnson",
    email: "leah.johnson@globex.example",
    phone: "+1-202-555-0189",
    company: "Globex Corporation",
    source: "LinkedIn",
    estimatedValue: 52000,
    status: "NEGOTIATION",
    assignedTo: "manager",
    createdBy: "admin",
    notes: "Final pricing round this week.",
    tags: ["strategic", "high-value"]
  },
  {
    key: "innotech-won",
    fullName: "Ethan Brooks",
    email: "ethan.brooks@innotech.example",
    phone: "+1-202-555-0194",
    company: "Innotech Solutions",
    source: "Conference",
    estimatedValue: 36000,
    status: "WON",
    assignedTo: "executive",
    createdBy: "manager",
    convertedAt: "2026-03-19T12:00:00.000Z",
    notes: "Deal closed. Customer onboarding started.",
    tags: ["expansion"]
  },
  {
    key: "vertex-won",
    fullName: "Sophia Nguyen",
    email: "sophia.nguyen@vertex.example",
    phone: "+1-202-555-0122",
    company: "Vertex Health",
    source: "Inbound Campaign",
    estimatedValue: 28000,
    status: "WON",
    assignedTo: "manager",
    createdBy: "admin",
    convertedAt: "2026-03-25T09:30:00.000Z",
    notes: "Signed annual contract.",
    tags: ["healthcare"]
  },
  {
    key: "horizon-lost",
    fullName: "Daniel Kim",
    email: "daniel.kim@horizon.example",
    phone: "+1-202-555-0110",
    company: "Horizon Retail",
    source: "Cold Outreach",
    estimatedValue: 11000,
    status: "LOST",
    assignedTo: "executive",
    createdBy: "manager",
    notes: "Lost to incumbent vendor.",
    tags: ["competitive"]
  }
];

const customerSeeds = [
  {
    key: "innotech-customer",
    leadKey: "innotech-won",
    stage: "Active",
    value: 36000,
    accountManager: "executive",
    interactionSummary: "Kickoff completed and implementation timeline approved."
  },
  {
    key: "vertex-customer",
    leadKey: "vertex-won",
    stage: "Onboarding",
    value: 28000,
    accountManager: "manager",
    interactionSummary: "Training sessions scheduled for customer success team."
  }
];

const followUpSeeds = [
  {
    key: "followup-acme-call",
    leadKey: "acme-qualification",
    assignedTo: "executive",
    createdBy: "manager",
    dueDate: "2026-04-04T15:30:00.000Z",
    type: "CALL",
    status: "PENDING",
    notes: "[DEMO-FUP-1] Qualification call with procurement lead."
  },
  {
    key: "followup-northwind-email",
    leadKey: "northwind-proposal",
    assignedTo: "executive",
    createdBy: "manager",
    dueDate: "2026-04-06T11:00:00.000Z",
    type: "EMAIL",
    status: "PENDING",
    notes: "[DEMO-FUP-2] Send ROI sheet and case study."
  },
  {
    key: "followup-globex-demo",
    leadKey: "globex-negotiation",
    assignedTo: "manager",
    createdBy: "admin",
    dueDate: "2026-03-29T10:00:00.000Z",
    type: "DEMO",
    status: "COMPLETED",
    completedAt: "2026-03-29T11:15:00.000Z",
    outcome: "Completed. Security questionnaire submitted.",
    notes: "[DEMO-FUP-3] Technical demo with IT and security."
  }
];

const activitySeeds = [
  {
    seedKey: "activity-login-admin",
    action: "LOGIN",
    entityType: "auth",
    actor: "admin",
    entityRefType: "user",
    entityRef: "admin",
    metadata: { note: "Demo admin login" }
  },
  {
    seedKey: "activity-create-lead",
    action: "CREATE_LEAD",
    entityType: "lead",
    actor: "manager",
    entityRefType: "lead",
    entityRef: "acme-qualification",
    metadata: { source: "demo-seed" }
  },
  {
    seedKey: "activity-convert-lead",
    action: "CONVERT_LEAD",
    entityType: "lead",
    actor: "executive",
    entityRefType: "lead",
    entityRef: "innotech-won",
    metadata: { source: "demo-seed" }
  },
  {
    seedKey: "activity-followup",
    action: "SCHEDULE_FOLLOWUP",
    entityType: "followup",
    actor: "manager",
    entityRefType: "followup",
    entityRef: "followup-acme-call",
    metadata: { source: "demo-seed" }
  }
];

const getDemoTag = (key) => `demo:${key}`;

const upsertUser = async (seed) => {
  const email = seed.email.toLowerCase();
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      name: seed.name,
      email,
      password: seed.password,
      role: seed.role,
      isActive: true
    });
  } else {
    user.name = seed.name;
    user.role = seed.role;
    user.isActive = true;
    user.password = seed.password;
  }

  await user.save();
  return user;
};

const upsertLead = async (seed, usersByKey) => {
  const demoTag = getDemoTag(seed.key);
  let lead = await Lead.findOne({ tags: demoTag });

  if (!lead) {
    lead = new Lead({
      source: "Demo Seed"
    });
  }

  lead.fullName = seed.fullName;
  lead.email = seed.email.toLowerCase();
  lead.phone = seed.phone;
  lead.company = seed.company;
  lead.source = seed.source;
  lead.estimatedValue = Number(seed.estimatedValue || 0);
  lead.status = seed.status;
  lead.assignedTo = usersByKey[seed.assignedTo]._id;
  lead.createdBy = usersByKey[seed.createdBy]._id;
  lead.notes = seed.notes;
  lead.tags = Array.from(new Set([...(seed.tags || []), "demo", demoTag]));

  if (seed.status === "WON") {
    lead.convertedAt = seed.convertedAt ? new Date(seed.convertedAt) : lead.convertedAt || new Date();
  } else {
    lead.convertedAt = null;
    lead.convertedCustomer = null;
  }

  await lead.save();
  return lead;
};

const upsertCustomer = async (seed, leadsByKey, usersByKey) => {
  const lead = leadsByKey[seed.leadKey];
  let customer = await Customer.findOne({ leadRef: lead._id });

  if (!customer) {
    customer = new Customer({ leadRef: lead._id });
  }

  customer.fullName = lead.fullName;
  customer.email = lead.email;
  customer.phone = lead.phone;
  customer.company = lead.company;
  customer.accountManager = usersByKey[seed.accountManager]._id;
  customer.value = Number(seed.value || lead.estimatedValue || 0);
  customer.stage = seed.stage;

  const hasSeedInteraction = customer.interactions.some(
    (interaction) => interaction.summary === `${seed.interactionSummary} [Demo Seed]`
  );

  if (!hasSeedInteraction) {
    customer.interactions.push({
      interactionType: "NOTE",
      summary: `${seed.interactionSummary} [Demo Seed]`,
      createdBy: usersByKey[seed.accountManager]._id
    });
  }

  await customer.save();

  lead.convertedCustomer = customer._id;
  lead.status = "WON";
  lead.convertedAt = lead.convertedAt || new Date();
  await lead.save();

  return customer;
};

const upsertFollowUp = async (seed, leadsByKey, usersByKey) => {
  const lead = leadsByKey[seed.leadKey];

  let followUp = await FollowUp.findOne({
    lead: lead._id,
    notes: seed.notes
  });

  if (!followUp) {
    followUp = new FollowUp({
      lead: lead._id,
      notes: seed.notes
    });
  }

  followUp.assignedTo = usersByKey[seed.assignedTo]._id;
  followUp.createdBy = usersByKey[seed.createdBy]._id;
  followUp.dueDate = new Date(seed.dueDate);
  followUp.type = seed.type;
  followUp.status = seed.status;
  followUp.outcome = seed.outcome || undefined;
  followUp.completedAt = seed.completedAt ? new Date(seed.completedAt) : undefined;

  await followUp.save();
  return followUp;
};

const refreshLeadFollowUpDates = async (leadId) => {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    return;
  }

  const nextPending = await FollowUp.findOne({
    lead: lead._id,
    status: "PENDING"
  }).sort({ dueDate: 1 });

  const latestCompleted = await FollowUp.findOne({
    lead: lead._id,
    status: "COMPLETED"
  }).sort({ completedAt: -1, updatedAt: -1 });

  lead.nextFollowUpDate = nextPending ? nextPending.dueDate : null;
  lead.lastFollowUpAt = latestCompleted ? latestCompleted.completedAt || latestCompleted.updatedAt : null;
  await lead.save();
};

const upsertActivity = async (seed, usersByKey, leadsByKey, customersByKey, followUpsByKey) => {
  const actor = usersByKey[seed.actor];

  let entityId = null;
  if (seed.entityRefType === "user") {
    entityId = usersByKey[seed.entityRef]._id;
  }
  if (seed.entityRefType === "lead") {
    entityId = leadsByKey[seed.entityRef]._id;
  }
  if (seed.entityRefType === "customer") {
    entityId = customersByKey[seed.entityRef]._id;
  }
  if (seed.entityRefType === "followup") {
    entityId = followUpsByKey[seed.entityRef]._id;
  }

  await Activity.updateOne(
    {
      action: seed.action,
      entityType: seed.entityType,
      entityId,
      actor: actor._id,
      "metadata.seedKey": seed.seedKey
    },
    {
      $setOnInsert: {
        action: seed.action,
        entityType: seed.entityType,
        entityId,
        actor: actor._id,
        metadata: {
          ...seed.metadata,
          seedKey: seed.seedKey
        }
      }
    },
    { upsert: true }
  );
};

const seedDemoData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI. Configure server/.env before running the demo seed.");
  }

  await connectDB();

  const usersByKey = {};
  for (const seed of userSeeds) {
    usersByKey[seed.key] = await upsertUser(seed);
  }

  const leadsByKey = {};
  for (const seed of leadSeeds) {
    leadsByKey[seed.key] = await upsertLead(seed, usersByKey);
  }

  const customersByKey = {};
  for (const seed of customerSeeds) {
    customersByKey[seed.key] = await upsertCustomer(seed, leadsByKey, usersByKey);
  }

  const followUpsByKey = {};
  for (const seed of followUpSeeds) {
    followUpsByKey[seed.key] = await upsertFollowUp(seed, leadsByKey, usersByKey);
  }

  for (const lead of Object.values(leadsByKey)) {
    await refreshLeadFollowUpDates(lead._id);
  }

  for (const seed of activitySeeds) {
    await upsertActivity(seed, usersByKey, leadsByKey, customersByKey, followUpsByKey);
  }

  const [userCount, leadCount, customerCount, followUpCount, activityCount] = await Promise.all([
    User.countDocuments(),
    Lead.countDocuments(),
    Customer.countDocuments(),
    FollowUp.countDocuments(),
    Activity.countDocuments({ "metadata.seedKey": { $exists: true } })
  ]);

  console.log("Demo data seeding completed.");
  console.log(`Users: ${userCount}`);
  console.log(`Leads: ${leadCount}`);
  console.log(`Customers: ${customerCount}`);
  console.log(`Follow-ups: ${followUpCount}`);
  console.log(`Seeded activities: ${activityCount}`);

  console.log("\nDemo credentials:");
  userSeeds.forEach((seed) => {
    console.log(`- ${seed.role}: ${seed.email} / ${seed.password}`);
  });
};

seedDemoData()
  .catch((error) => {
    console.error("Demo seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
