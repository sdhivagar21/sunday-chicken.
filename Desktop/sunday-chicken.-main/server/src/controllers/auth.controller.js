const { query }          = require('../config/database');
const { hashPassword, comparePassword, signToken, generateOrderNumber } = require('../utils');
const { successResponse, errorResponse } = require('../utils');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // Check phone uniqueness
    const exists = await query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (exists.rows.length)
      return errorResponse(res, 'Phone number already registered', 409);

    const password_hash = await hashPassword(password);
    const { rows } = await query(
      `INSERT INTO users (name, phone, email, password_hash)
       VALUES ($1,$2,$3,$4) RETURNING id, name, phone, email, role`,
      [name.trim(), phone.trim(), email?.trim() || null, password_hash]
    );

    const user  = rows[0];
    const token = signToken({ id: user.id, role: user.role });
    return successResponse(res, { user, token }, 'Registered successfully', 201);
  } catch (err) {
    console.error('register error:', err);
    return errorResponse(res, 'Registration failed');
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const { rows } = await query(
      'SELECT id, name, phone, email, role, password_hash, is_active FROM users WHERE phone = $1',
      [phone.trim()]
    );
    const user = rows[0];
    if (!user) return errorResponse(res, 'Invalid phone or password', 401);
    if (!user.is_active) return errorResponse(res, 'Account is deactivated', 403);

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) return errorResponse(res, 'Invalid phone or password', 401);

    const { password_hash: _, ...safeUser } = user;
    const token = signToken({ id: safeUser.id, role: safeUser.role });
    return successResponse(res, { user: safeUser, token }, 'Login successful');
  } catch (err) {
    console.error('login error:', err);
    return errorResponse(res, 'Login failed');
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, phone, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    return successResponse(res, { user: rows[0] });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch user');
  }
};

module.exports = { register, login, me };
