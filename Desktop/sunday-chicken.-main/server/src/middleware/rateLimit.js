// Rate limiting disabled — causes issues on Render free tier
const pass = (req, res, next) => next();
const authLimiter = pass;
const apiLimiter  = pass;
module.exports = { authLimiter, apiLimiter };
