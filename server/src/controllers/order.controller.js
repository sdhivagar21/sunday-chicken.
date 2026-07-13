const { query, getClient } = require('../config/database');
const { successResponse, errorResponse, generateOrderNumber, calculateLineTotal } = require('../utils');
const https = require('https');

// ── Send WhatsApp via Green API ───────────────────────────────────
const sendWhatsAppMessage = (toPhone, message) => {
  return new Promise((resolve) => {
    try {
      const idInstance       = process.env.GREEN_API_ID;
      const apiTokenInstance = process.env.GREEN_API_TOKEN;

      if (!idInstance || !apiTokenInstance) {
        console.log('ℹ️  GREEN_API not configured — skipping WhatsApp');
        return resolve(false);
      }

      const postData = JSON.stringify({
        chatId:  `${toPhone}@c.us`,
        message,
      });

      const options = {
        hostname: 'api.green-api.com',
        path:     `/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        method:   'POST',
        headers:  {
          'Content-Type':   'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.idMessage) {
              console.log(`✅ WhatsApp sent to ${toPhone}`);
              resolve(true);
            } else {
              console.error(`❌ WhatsApp failed to ${toPhone}:`, data);
              resolve(false);
            }
          } catch {
            resolve(false);
          }
        });
      });

      req.on('error', (e) => {
        console.error('❌ WhatsApp error:', e.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    } catch (err) {
      console.error('WhatsApp send error:', err.message);
      resolve(false);
    }
  });
};

// ── Notify ADMIN about new order ─────────────────────────────────
const notifyAdmin = async (orderData) => {
  const ADMIN_PHONE = process.env.ADMIN_WHATSAPP_PHONE || '916383174213';

  const { order_number, customer_name, customer_phone,
          delivery_address, landmark, payment_method, total_amount, items } = orderData;

  const itemLines = items.map(i =>
    `  • ${i.product_name} (${i.weight_kg}kg x${i.quantity}) = ₹${i.line_total}`
  ).join('\n');

  const message =
    `🐔 *NEW ORDER - Sunday Chicken*\n\n` +
    `📋 Order: *${order_number}*\n` +
    `👤 Customer: *${customer_name}*\n` +
    `📞 Phone: *${customer_phone}*\n` +
    `📍 Address: ${delivery_address}${landmark ? ', ' + landmark : ''}\n` +
    `💳 Payment: ${payment_method === 'cod' ? 'Cash on Delivery' : 'UPI'}\n\n` +
    `🛒 *Items:*\n${itemLines}\n\n` +
    `💰 *Total: ₹${total_amount}*\n\n` +
    `⚡ Please confirm delivery time to customer!`;

  await sendWhatsAppMessage(ADMIN_PHONE, message);
};

// ── Notify CUSTOMER about order confirmation ──────────────────────
const notifyCustomer = async (orderData) => {
  const { order_number, customer_name, customer_phone,
          delivery_address, total_amount, items, payment_method } = orderData;

  // Only send if customer phone is valid Indian mobile
  const cleanPhone = customer_phone.replace(/\D/g, '');
  const phoneWith91 = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  if (phoneWith91.length !== 12) {
    console.log('⚠️  Invalid customer phone, skipping customer WhatsApp');
    return;
  }

  const itemLines = items.map(i =>
    `  • ${i.product_name} (${i.weight_kg}kg) = ₹${i.line_total}`
  ).join('\n');

  const ADMIN_PHONE_DISPLAY = process.env.ADMIN_WHATSAPP_PHONE?.replace('91','') || '6383174213';

  const message =
    `🐔 *Sunday Chicken - Order Confirmed!*\n\n` +
    `Hi *${customer_name}*! Your order has been placed successfully.\n\n` +
    `📋 *Order ID: ${order_number}*\n\n` +
    `🛒 *Your Items:*\n${itemLines}\n\n` +
    `📍 Delivering to: ${delivery_address}\n` +
    `💳 Payment: ${payment_method === 'cod' ? 'Cash on Delivery' : 'UPI'}\n` +
    `💰 *Total Amount: ₹${total_amount}*\n\n` +
    `⏳ Delivery time will be confirmed shortly.\n\n` +
    `📞 *Questions? Call us: ${ADMIN_PHONE_DISPLAY}*\n\n` +
    `Thank you for ordering! 😊`;

  await sendWhatsAppMessage(phoneWith91, message);
};

// POST /api/orders
const createOrder = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const {
      customer_name, customer_phone, delivery_address, landmark,
      payment_method, order_notes, items,
    } = req.body;

    const settingsRes = await client.query(
      "SELECT key, value FROM settings WHERE key IN ('delivery_charge','profit_percentage')"
    );
    const settings        = Object.fromEntries(settingsRes.rows.map(r => [r.key, Number(r.value)]));
    const delivery_charge = settings.delivery_charge   ?? 30;
    const profit_pct      = settings.profit_percentage ?? 10;

    let subtotal = 0;
    const pricedItems = [];

    for (const item of items) {
      const prodRes = await client.query(
        'SELECT id, name, cost_per_kg, is_available FROM products WHERE id=$1',
        [item.product_id]
      );
      const product = prodRes.rows[0];
      if (!product || !product.is_available)
        throw new Error(`Product "${item.product_name || item.product_id}" is unavailable`);

      const line_total = calculateLineTotal(product.cost_per_kg, item.weight_kg, item.quantity, profit_pct);
      subtotal += line_total;
      pricedItems.push({
        ...item,
        cost_per_kg:  product.cost_per_kg,
        product_name: product.name,
        line_total,
      });
    }

    const total_amount = subtotal + delivery_charge;
    const order_number = generateOrderNumber();

    const orderRes = await client.query(
      `INSERT INTO orders
        (order_number, user_id, customer_name, customer_phone, delivery_address, landmark,
         payment_method, subtotal, delivery_charge, total_amount, order_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        order_number, req.user?.id || null, customer_name, customer_phone,
        delivery_address, landmark || null, payment_method,
        subtotal, delivery_charge, total_amount, order_notes || null,
      ]
    );
    const order = orderRes.rows[0];

    for (const item of pricedItems) {
      await client.query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, cost_per_kg, weight_kg, quantity, special_instruction, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          order.id, item.product_id, item.product_name, item.cost_per_kg,
          item.weight_kg, item.quantity, item.special_instruction || null, item.line_total,
        ]
      );
    }

    await client.query(
      'INSERT INTO payments (order_id, method, amount) VALUES ($1,$2,$3)',
      [order.id, payment_method, total_amount]
    );

    await client.query('COMMIT');

    // Send WhatsApp to BOTH admin and customer (non-blocking)
    const orderPayload = {
      order_number, customer_name, customer_phone,
      delivery_address, landmark, payment_method,
      total_amount, items: pricedItems,
    };

    notifyAdmin(orderPayload).catch(e => console.error('Admin notify error:', e));
    notifyCustomer(orderPayload).catch(e => console.error('Customer notify error:', e));

    return successResponse(res, { order, order_number }, 'Order placed successfully', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createOrder error:', err);
    return errorResponse(res, err.message || 'Failed to place order');
  } finally {
    client.release();
  }
};

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
    if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id)
      return errorResponse(res, 'Forbidden', 403);
    return successResponse(res, { order: rows[0] });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch order');
  }
};

module.exports = { createOrder, getMyOrders, getById };
