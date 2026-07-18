const router     = require('express').Router();
const adminCtrl  = require('../controllers/admin.controller');
const productCtrl= require('../controllers/product.controller');
const catCtrl    = require('../controllers/category.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', adminCtrl.getDashboard);

// Products — NO multer, images sent as base64 in JSON body
router.get('/products',            productCtrl.adminGetAll);
router.post('/products',           productCtrl.create);
router.put('/products/:id',        productCtrl.update);
router.patch('/products/:id/cost', productCtrl.updateCost);
router.delete('/products/:id',     productCtrl.remove);

// Categories
router.post('/categories',        catCtrl.create);
router.put('/categories/:id',     catCtrl.update);
router.delete('/categories/:id',  catCtrl.remove);

// Orders
router.get('/orders',              adminCtrl.getAllOrders);
router.patch('/orders/:id/accept', adminCtrl.acceptOrder);
router.patch('/orders/:id/reject', adminCtrl.rejectOrder);
router.patch('/orders/:id/status', adminCtrl.updateStatus);
router.patch('/orders/:id/eta',    adminCtrl.updateETA);

// Customers
router.get('/customers', adminCtrl.getCustomers);

// Reports
router.get('/reports/summary', adminCtrl.getReportSummary);

// Settings
router.get('/settings',   adminCtrl.getSettings);
router.patch('/settings', adminCtrl.updateSettings);

module.exports = router;
