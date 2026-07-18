const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOrderRules } = require('../validators/order.validator');

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    const { verifyToken } = require('../utils');
    const { query }       = require('../config/database');
    const decoded = verifyToken(header.split(' ')[1]);
    const { rows } = await query(
      'SELECT id, name, phone, email, role FROM users WHERE id=$1 AND is_active=true',
      [decoded.id]
    );
    if (rows[0]) req.user = rows[0];
  } catch { }
  next();
};
   
router.post('/',   optionalAuth, createOrderRules, validate, ctrl.createOrder);
router.get('/my',  authenticate, ctrl.getMyOrders);
router.get('/:id', optionalAuth, ctrl.getById);

module.exports = router;
