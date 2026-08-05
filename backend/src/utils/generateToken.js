const jwt = require('jsonwebtoken');

function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from env');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from env');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
