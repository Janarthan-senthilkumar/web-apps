const asyncHandler = require("express-async-handler");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { USER_ROLES } = require("../utils/constants");
const { createActivity } = require("../services/activityService");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("Email is already in use.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "executive"
  });

  await createActivity({
    action: "REGISTER",
    entityType: "user",
    entityId: user._id,
    actor: user._id,
    metadata: { role: user.role }
  });

  res.status(201).json({
    token: generateToken(user._id),
    user: sanitizeUser(user)
  });
});

const bootstrapAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  const totalUsers = await User.countDocuments();
  if (totalUsers > 0) {
    res.status(403);
    throw new Error("Bootstrap admin can only be created when no users exist.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "admin"
  });

  await createActivity({
    action: "BOOTSTRAP_ADMIN",
    entityType: "user",
    entityId: user._id,
    actor: user._id,
    metadata: { role: user.role }
  });

  res.status(201).json({
    token: generateToken(user._id),
    user: sanitizeUser(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials.");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("User is deactivated.");
  }

  await createActivity({
    action: "LOGIN",
    entityType: "auth",
    entityId: user._id,
    actor: user._id
  });

  res.json({
    token: generateToken(user._id),
    user: sanitizeUser(user)
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "name email role isActive createdAt").sort({ createdAt: -1 });
  res.json({ users });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error("Name, email, password, and role are required.");
  }

  if (!USER_ROLES.includes(role)) {
    res.status(400);
    throw new Error("Invalid role.");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("Email is already in use.");
  }

  const user = await User.create({ name, email, password, role });

  await createActivity({
    action: "CREATE_USER",
    entityType: "user",
    entityId: user._id,
    actor: req.user._id,
    metadata: { role: user.role }
  });

  res.status(201).json({ user: sanitizeUser(user) });
});

module.exports = {
  register,
  bootstrapAdmin,
  login,
  me,
  getUsers,
  createUser
};
