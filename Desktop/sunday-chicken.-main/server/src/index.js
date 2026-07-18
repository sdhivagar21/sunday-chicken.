require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const { port, nodeEnv } = require('./config');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { testConnection }         = require('./config/database');

const app = express();

// Required for Render (proxy)
app.set('trust proxy', 1);

// Security
app.use(helmet());

// CORS — allow all origins (fixes frontend blocked issue)
app.use(cors({ origin: '*' }));

// Parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Logging
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Sunday Chicken API', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth',       require('./routes/auth.routes'));
app.use('/api/products',   require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/orders',     require('./routes/order.routes'));
app.use('/api/admin',      require('./routes/admin.routes'));
app.use('/api/test',       require('./routes/test.routes'));

// Errors
app.use(notFound);
app.use(errorHandler);

// Start — test DB first then listen
const start = async () => {
  await testConnection();
  app.listen(port, () => {
    console.log(`🐔 Sunday Chicken API on port ${port} [${nodeEnv}]`);
  });
};

start();
module.exports = app;
