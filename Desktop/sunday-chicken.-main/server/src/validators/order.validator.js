const { body } = require('express-validator');

const createOrderRules = [
  body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
  body('customer_phone').trim().notEmpty().withMessage('Phone is required'),
  body('delivery_address').trim().notEmpty().withMessage('Delivery address is required'),
  body('payment_method').isIn(['cod','upi']).withMessage('Invalid payment method'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').notEmpty().withMessage('Product ID is required'),
  body('items.*.weight_kg').isFloat({ min: 0.25 }).withMessage('Invalid weight'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Invalid quantity'),
];

module.exports = { createOrderRules };
