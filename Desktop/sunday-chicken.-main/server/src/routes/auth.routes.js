const router       = require('express').Router();
const ctrl         = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate     = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const { registerRules, loginRules } = require('../validators/auth.validator');

router.post('/register', authLimiter, registerRules, validate, ctrl.register);
router.post('/login',    authLimiter, loginRules,    validate, ctrl.login);
router.get('/me',        authenticate, ctrl.me);

module.exports = router;
