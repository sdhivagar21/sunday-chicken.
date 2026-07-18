require('dotenv').config();

module.exports = {
  port:        process.env.PORT || 5000,
  nodeEnv:     process.env.NODE_ENV || 'development',
  jwtSecret:   process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION',
  jwtExpiry:   process.env.JWT_EXPIRY || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
