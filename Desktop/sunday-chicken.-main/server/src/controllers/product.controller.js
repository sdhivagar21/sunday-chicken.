const { query }    = require('../config/database');
const cloudinary   = require('../config/cloudinary');
const { successResponse, errorResponse } = require('../utils');

// Upload base64 string to Cloudinary
const uploadBase64 = async (base64String) => {
  const result = await cloudinary.uploader.upload(base64String, {
    folder:       'sunday-chicken/products',
    quality:      'auto',
    fetch_format: 'auto',
  });
  return { url: result.secure_url, public_id: result.public_id };
};

// GET /api/products
const getAll = async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    let sql = `SELECT p.*, c.name AS category_name FROM products p
               LEFT JOIN categories c ON c.id = p.category_id
               WHERE p.is_available = true`;
    const params = [];
    if (category) { params.push(category); sql += ` AND p.category_id = $${params.length}`; }
    if (featured === 'true') sql += ' AND p.is_featured = true';
    if (search) { params.push(`%${search}%`); sql += ` AND p.name ILIKE $${params.length}`; }
    sql += ' ORDER BY p.sort_order, p.created_at DESC';
    const { rows } = await query(sql, params);
    return successResponse(res, { products: rows });
  } catch (err) {
    console.error('getAll products:', err);
    return errorResponse(res, 'Failed to fetch products');
  }
};

// GET /api/products/:id
const getById = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return errorResponse(res, 'Product not found', 404);
    return successResponse(res, { product: rows[0] });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch product');
  }
};

// GET /api/admin/products
const adminGetAll = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.sort_order, p.created_at DESC`
    );
    return successResponse(res, { products: rows });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch products');
  }
};

// POST /api/admin/products
const create = async (req, res) => {
  try {
    const { name, description, cost_per_kg, category_id,
            is_featured, sort_order, image_base64 } = req.body;

    let image_url = null, image_public_id = null;

    if (image_base64) {
      console.log('📸 Uploading image to Cloudinary...');
      const uploaded  = await uploadBase64(image_base64);
      image_url       = uploaded.url;
      image_public_id = uploaded.public_id;
      console.log('✅ Image uploaded:', image_url);
    }

    const { rows } = await query(
      `INSERT INTO products (name, description, cost_per_kg, category_id,
        image_url, image_public_id, is_featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, description, cost_per_kg, category_id || null,
       image_url, image_public_id, is_featured || false, sort_order || 0]
    );
    return successResponse(res, { product: rows[0] }, 'Product created', 201);
  } catch (err) {
    console.error('create product:', err);
    return errorResponse(res, `Failed to create product: ${err.message}`);
  }
};

// PUT /api/admin/products/:id
const update = async (req, res) => {
  try {
    const { name, description, category_id, is_featured,
            is_available, sort_order, cost_per_kg,
            image_base64, remove_image } = req.body;

    // Get existing image info
    const cur = await query(
      'SELECT image_public_id, image_url FROM products WHERE id=$1', [req.params.id]
    );
    if (!cur.rows[0]) return errorResponse(res, 'Product not found', 404);

    let image_url       = cur.rows[0].image_url;
    let image_public_id = cur.rows[0].image_public_id;

    if (image_base64) {
      // Delete old from Cloudinary
      if (image_public_id) {
        await cloudinary.uploader.destroy(image_public_id).catch(() => {});
      }
      console.log('📸 Uploading new image...');
      const uploaded  = await uploadBase64(image_base64);
      image_url       = uploaded.url;
      image_public_id = uploaded.public_id;
      console.log('✅ Image updated:', image_url);
    } else if (remove_image) {
      if (image_public_id) {
        await cloudinary.uploader.destroy(image_public_id).catch(() => {});
      }
      image_url = null; image_public_id = null;
    }

    const { rows } = await query(
      `UPDATE products SET name=$1, description=$2, category_id=$3,
       is_featured=$4, is_available=$5, sort_order=$6, cost_per_kg=$7,
       image_url=$8, image_public_id=$9
       WHERE id=$10 RETURNING *`,
      [name, description, category_id || null, is_featured,
       is_available, sort_order || 0, cost_per_kg,
       image_url, image_public_id, req.params.id]
    );
    return successResponse(res, { product: rows[0] }, 'Product updated');
  } catch (err) {
    console.error('update product:', err);
    return errorResponse(res, `Failed to update product: ${err.message}`);
  }
};

// PATCH /api/admin/products/:id/cost
const updateCost = async (req, res) => {
  try {
    const { cost } = req.body;
    if (!cost || isNaN(cost) || Number(cost) <= 0)
      return errorResponse(res, 'Invalid cost', 422);
    const { rows } = await query(
      'UPDATE products SET cost_per_kg=$1 WHERE id=$2 RETURNING id, name, cost_per_kg',
      [Number(cost), req.params.id]
    );
    if (!rows[0]) return errorResponse(res, 'Product not found', 404);
    return successResponse(res, { product: rows[0] }, 'Cost updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update cost');
  }
};

// DELETE /api/admin/products/:id
const remove = async (req, res) => {
  try {
    const { rows } = await query(
      'DELETE FROM products WHERE id=$1 RETURNING image_public_id', [req.params.id]
    );
    if (!rows[0]) return errorResponse(res, 'Product not found', 404);
    if (rows[0].image_public_id) {
      await cloudinary.uploader.destroy(rows[0].image_public_id).catch(() => {});
    }
    return successResponse(res, null, 'Product deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete product');
  }
};

module.exports = { getAll, getById, adminGetAll, create, update, updateCost, remove };
