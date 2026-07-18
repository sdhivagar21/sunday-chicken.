const { verifyToken } = require('../utils');
const { query }       = require('../config/database');

/** Authenticate any logged-in user */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token   = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch fresh user to check is_active
    const { rows } = await query('SELECT id, name, phone, email, role, is_active FROM users WHERE id = $1', [decoded.id]);
    if (!rows[0] || !rows[0].is_active)
      return res.status(401).json({ success: false, message: 'Account not found or inactive' });

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/** Restrict to admins only */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

module.exports = { authenticate, requireAdmin };
