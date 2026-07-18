const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { jwtSecret, jwtExpiry } = require('../config');

/** Hash a password */
const hashPassword = (password) => bcrypt.hash(password, 12);

/** Compare a plain password with a hash */
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

/** Sign a JWT */
const signToken = (payload) => jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });

/** Verify a JWT */
const verifyToken = (token) => jwt.verify(token, jwtSecret);

/** Generate a unique order number: SC-YYYYMMDD-XXXXXX */
const generateOrderNumber = () => {
  const date   = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const random = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `SC-${date}-${random}`;
};

/** Standard API response helper */
const successResponse = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });

/** Calculate selling price */
const calculateLineTotal = (costPerKg, weightKg, quantity, profitPct = 10) => {
  const cost   = costPerKg * weightKg;
  const profit = cost * (profitPct / 100);
  return parseFloat(((cost + profit) * quantity).toFixed(2));
};

module.exports = {
  hashPassword, comparePassword,
  signToken, verifyToken,
  generateOrderNumber,
  successResponse, errorResponse,
  calculateLineTotal,
};
