const { query, getClient } = require('../config/database');
const { successResponse, errorResponse, generateOrderNumber, calculateLineTotal } = require('../utils');

// POST /api/orders
const createOrder = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const {
      customer_name, customer_phone, delivery_address, landmark,
      payment_method, order_notes, items,
    } = req.body;

    // Fetch delivery charge + profit % from settings
    const settingsRes = await client.query(
      "SELECT key, value FROM settings WHERE key IN ('delivery_charge','profit_percentage')"
    );
    const settings = Object.fromEntries(settingsRes.rows.map(r => [r.key, Number(r.value)]));
    const delivery_charge    = settings.delivery_charge    ?? 30;
    const profit_pct         = settings.profit_percentage  ?? 10;

    // Validate & price each item
    let subtotal = 0;
    const pricedItems = [];
    for (const item of items) {
      const prodRes = await client.query(
        'SELECT id, name, cost_per_kg, is_available FROM products WHERE id=$1', [item.product_id]
      );
      const product = prodRes.rows[0];
      if (!product || !product.is_available)
        throw new Error(`Product "${item.product_name || item.product_id}" is unavailable`);

      const line_total = calculateLineTotal(product.cost_per_kg, item.weight_kg, item.quantity, profit_pct);
      subtotal += line_total;
      pricedItems.push({ ...item, cost_per_kg: product.cost_per_kg, product_name: product.name, line_total });
    }

    const total_amount   = subtotal + delivery_charge;
    const order_number   = generateOrderNumber();

    // Insert order
    const orderRes = await client.query(
      `INSERT INTO orders
        (order_number, user_id, customer_name, customer_phone, delivery_address, landmark,
         payment_method, subtotal, delivery_charge, total_amount, order_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [order_number, req.user?.id || null, customer_name, customer_phone,
       delivery_address, landmark || null, payment_method,
       subtotal, delivery_charge, total_amount, order_notes || null]
    );
    const order = orderRes.rows[0];

    // Insert order items
    for (const item of pricedItems) {
      await client.query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, cost_per_kg, weight_kg, quantity, special_instruction, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [order.id, item.product_id, item.product_name, item.cost_per_kg,
         item.weight_kg, item.quantity, item.special_instruction || null, item.line_total]
      );
    }

    // Insert payment record
    await client.query(
      'INSERT INTO payments (order_id, method, amount) VALUES ($1,$2,$3)',
      [order.id, payment_method, total_amount]
    );

    await client.query('COMMIT');
    return successResponse(res, { order, order_number }, 'Order placed successfully', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createOrder error:', err);
    return errorResponse(res, err.message || 'Failed to place order');
  } finally {
    client.release();
  }
};

// GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT o.*,
        json_agg(json_build_object(
          'id', oi.id, 'product_name', oi.product_name,
          'weight_kg', oi.weight_kg, 'quantity', oi.quantity,
          'line_total', oi.line_total, 'special_instruction', oi.special_instruction
        ) ORDER BY oi.created_at) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    return successResponse(res, { orders: rows });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch orders');
  }
};

// GET /api/orders/:id
const getById = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT o.*,
        json_agg(json_build_object(
          'id', oi.id, 'product_name', oi.product_name,
          'weight_kg', oi.weight_kg, 'quantity', oi.quantity,
          'line_total', oi.line_total, 'special_instruction', oi.special_instruction
        ) ORDER BY oi.created_at) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [req.params.id]
    );
    if (!rows[0]) return errorResponse(res, 'Order not found', 404);
    // Customers can only see their own orders
    if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id)
      return errorResponse(res, 'Forbidden', 403);
    return successResponse(res, { order: rows[0] });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch order');
  }
};

module.exports = { createOrder, getMyOrders, getById };
