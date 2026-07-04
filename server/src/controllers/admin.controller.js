const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils');

// GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    let sql = `
      SELECT o.*,
        json_agg(json_build_object(
          'id', oi.id, 'product_name', oi.product_name,
          'weight_kg', oi.weight_kg, 'quantity', oi.quantity,
          'line_total', oi.line_total, 'special_instruction', oi.special_instruction
        ) ORDER BY oi.created_at) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE 1=1`;
    const params = [];
    if (status) { params.push(status); sql += ` AND o.status=$${params.length}`; }
    if (date)   { params.push(date);   sql += ` AND DATE(o.created_at)=$${params.length}`; }
    sql += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const { rows } = await query(sql, params);
    return successResponse(res, { orders: rows });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch orders');
  }
};

// PATCH /api/admin/orders/:id/accept
const acceptOrder = async (req, res) => {
  try {
    const { estimated_delivery } = req.body;
    const { rows } = await query(
      `UPDATE orders SET status='preparing', estimated_delivery=$1 WHERE id=$2 AND status='received' RETURNING *`,
      [estimated_delivery || '35 Minutes', req.params.id]
    );
    if (!rows[0]) return errorResponse(res, 'Order not found or already processed', 404);
    return successResponse(res, { order: rows[0] }, 'Order accepted');
  } catch (err) {
    return errorResponse(res, 'Failed to accept order');
  }
};

// PATCH /api/admin/orders/:id/reject
const rejectOrder = async (req, res) => {
  try {
    const { admin_note } = req.body;
    const { rows } = await query(
      `UPDATE orders SET status='rejected', admin_note=$1 WHERE id=$2 AND status='received' RETURNING *`,
      [admin_note || null, req.params.id]
    );
    if (!rows[0]) return errorResponse(res, 'Order not found or already processed', 404);
    return successResponse(res, { order: rows[0] }, 'Order rejected');
  } catch (err) {
    return errorResponse(res, 'Failed to reject order');
  }
};

// PATCH /api/admin/orders/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['received','preparing','packed','out_for_delivery','delivered'];
    if (!validStatuses.includes(status))
      return errorResponse(res, 'Invalid status', 422);
    const { rows } = await query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows[0]) return errorResponse(res, 'Order not found', 404);
    return successResponse(res, { order: rows[0] }, 'Status updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update status');
  }
};

// PATCH /api/admin/orders/:id/eta
const updateETA = async (req, res) => {
  try {
    const { eta } = req.body;
    const { rows } = await query(
      'UPDATE orders SET estimated_delivery=$1 WHERE id=$2 RETURNING id, estimated_delivery, status',
      [eta, req.params.id]
    );
    if (!rows[0]) return errorResponse(res, 'Order not found', 404);
    return successResponse(res, { order: rows[0] }, 'ETA updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update ETA');
  }
};

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [todayOrders, pending, revenue, bestSelling, recentOrders, allCustomers] = await Promise.all([
      query("SELECT COUNT(*) FROM orders WHERE DATE(created_at)=$1", [today]),
      query("SELECT COUNT(*) FROM orders WHERE status NOT IN ('delivered','rejected')"),
      query("SELECT COALESCE(SUM(total_amount),0) AS total FROM orders WHERE DATE(created_at)=$1 AND status!='rejected'", [today]),
      query(`SELECT oi.product_name, SUM(oi.quantity) AS total_qty, SUM(oi.line_total) AS total_revenue
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE o.status != 'rejected'
             GROUP BY oi.product_name ORDER BY total_qty DESC LIMIT 5`),
      query(`SELECT o.id, o.order_number, o.customer_name, o.total_amount, o.status, o.created_at
             FROM orders o ORDER BY o.created_at DESC LIMIT 10`),
      query("SELECT COUNT(*) FROM users WHERE role='customer'"),
    ]);

    return successResponse(res, {
      todayOrders:    Number(todayOrders.rows[0].count),
      pendingOrders:  Number(pending.rows[0].count),
      todayRevenue:   Number(revenue.rows[0].total),
      totalCustomers: Number(allCustomers.rows[0].count),
      bestSelling:    bestSelling.rows,
      recentOrders:   recentOrders.rows,
    });
  } catch (err) {
    console.error('dashboard error:', err);
    return errorResponse(res, 'Failed to load dashboard');
  }
};

// GET /api/admin/customers
const getCustomers = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.name, u.phone, u.email, u.is_active, u.created_at,
         COUNT(o.id) AS order_count,
         COALESCE(SUM(o.total_amount),0) AS total_spent
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id AND o.status != 'rejected'
       WHERE u.role = 'customer'
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    return successResponse(res, { customers: rows });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch customers');
  }
};

// GET /api/admin/reports/summary
const getReportSummary = async (req, res) => {
  try {
    const { period = 'daily', date } = req.query;
    const today = date || new Date().toISOString().slice(0, 10);
    let dateFilter;
    if (period === 'daily')   dateFilter = `DATE(o.created_at) = '${today}'`;
    else if (period === 'weekly')  dateFilter = `o.created_at >= NOW() - INTERVAL '7 days'`;
    else if (period === 'monthly') dateFilter = `DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', NOW())`;
    else dateFilter = `DATE(o.created_at) = '${today}'`;

    const { rows } = await query(`
      SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount),0) AS total_revenue,
        COALESCE(SUM(subtotal),0) AS total_subtotal,
        COUNT(CASE WHEN status='delivered' THEN 1 END) AS delivered,
        COUNT(CASE WHEN status='rejected' THEN 1 END) AS rejected
      FROM orders o WHERE ${dateFilter} AND status != 'rejected'
    `);
    return successResponse(res, { report: rows[0], period });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch report');
  }
};

// GET /api/admin/settings
const getSettings = async (req, res) => {
  try {
    const { rows } = await query('SELECT key, value FROM settings');
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
    return successResponse(res, { settings });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch settings');
  }
};

// PATCH /api/admin/settings
const updateSettings = async (req, res) => {
  try {
    const updates = req.body; // { delivery_charge: 30, profit_percentage: 10 }
    for (const [key, value] of Object.entries(updates)) {
      await query(
        'INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()',
        [key, String(value)]
      );
    }
    return successResponse(res, null, 'Settings updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update settings');
  }
};

module.exports = {
  getAllOrders, acceptOrder, rejectOrder, updateStatus, updateETA,
  getDashboard, getCustomers, getReportSummary, getSettings, updateSettings,
};
