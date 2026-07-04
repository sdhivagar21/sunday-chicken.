const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils');

const getAll = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM categories WHERE is_active=true ORDER BY sort_order, name'
    );
    return successResponse(res, { categories: rows });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch categories');
  }
};

const create = async (req, res) => {
  try {
    const { name, slug, image_url, sort_order } = req.body;
    const { rows } = await query(
      'INSERT INTO categories (name, slug, image_url, sort_order) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, slug, image_url || null, sort_order || 0]
    );
    return successResponse(res, { category: rows[0] }, 'Category created', 201);
  } catch (err) {
    if (err.code === '23505') return errorResponse(res, 'Category already exists', 409);
    return errorResponse(res, 'Failed to create category');
  }
};

const update = async (req, res) => {
  try {
    const { name, slug, image_url, sort_order, is_active } = req.body;
    const { rows } = await query(
      'UPDATE categories SET name=$1, slug=$2, image_url=$3, sort_order=$4, is_active=$5 WHERE id=$6 RETURNING *',
      [name, slug, image_url, sort_order, is_active, req.params.id]
    );
    if (!rows[0]) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, { category: rows[0] }, 'Category updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update category');
  }
};

const remove = async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM categories WHERE id=$1 RETURNING id', [req.params.id]);
    if (!rows[0]) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, null, 'Category deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete category');
  }
};

module.exports = { getAll, create, update, remove };
