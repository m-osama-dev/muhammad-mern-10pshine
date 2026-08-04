const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/generateToken');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../config/logger');

function normalizeEmail(email) {
  if (typeof email !== 'string') {
    throw new AppError('Email must be a valid string', 400);
  }
  return email.trim().toLowerCase();
}

const signup = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!name || !email || !password) {
    throw new AppError('Name, email and password are all required', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('A user with this email already exists', 400);
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user.id);

  logger.info({ userId: user.id }, 'New user signed up');

  res.status(201).json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email },
    token,
  });
});

const login = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user.id);

  logger.info({ userId: user.id }, 'User logged in');

  res.status(200).json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email },
    token,
  });
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { tokenValidAfter: new Date() });

  logger.info({ userId: req.user.id }, 'User logged out');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (req.body.email !== undefined) {
    const email = normalizeEmail(req.body.email);
    if (email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        throw new AppError('That email is already in use', 400);
      }
      user.email = email;
    }
  }

  if (name) {
    user.name = name;
  }

  await user.save();

  logger.info({ userId: user.id }, 'User profile updated');

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
});

module.exports = { signup, login, logout, getMe, updateMe };