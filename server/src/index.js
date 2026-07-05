require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const { port, frontendUrl, nodeEnv } = require('./config');
const { errorHandler, notFound }     = require('./middleware/errorHandler');
const { apiLimiter }                 = require('./middleware/rateLimit');

const app = express();
app.set('trust proxy', 1);

// ── Security ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [frontendUrl, 'http://localhost:5173'],
  credentials: true,
}));

// ── Parsing ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────────
if (nodeEnv !== 'test') app.use(morgan('dev'));

// ── Rate Limiting ─────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health Check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Sunday Chicken API', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth.routes'));
app.use('/api/products',   require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/orders',     require('./routes/order.routes'));
app.use('/api/admin',      require('./routes/admin.routes'));

// ── Error Handling ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🐔 Sunday Chicken API running on port ${port} [${nodeEnv}]`);
  console.log(`   Health: http://localhost:${port}/health`);
  console.log(`   API:    http://localhost:${port}/api`);
});

module.exports = app;
