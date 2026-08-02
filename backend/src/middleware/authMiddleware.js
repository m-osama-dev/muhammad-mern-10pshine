const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized, no token provided', 401);
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      throw new AppError('Not authorized, invalid or expired token', 401);
    }
    // anything else (e.g. missing JWT_SECRET) is a real server error
    throw err;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('Not authorized, user no longer exists', 401);
  }

  req.user = { id: user.id };
  next();
});

module.exports = protect;