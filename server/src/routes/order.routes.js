const router     = require('express').Router();
const ctrl       = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const validate   = require('../middleware/validate');
const { createOrderRules } = require('../validators/order.validator');

router.post('/',    authenticate, createOrderRules, validate, ctrl.createOrder);
router.get('/my',   authenticate, ctrl.getMyOrders);
router.get('/:id',  authenticate, ctrl.getById);

module.exports = router;
