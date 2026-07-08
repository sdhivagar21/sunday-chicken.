import api from './api';

export const productService = {
  getAll:       (params)     => api.get('/products', { params }),
  getById:      (id)         => api.get(`/products/${id}`),
  getFeatured:  ()           => api.get('/products?featured=true'),
  // Admin
  adminGetAll:  ()           => api.get('/admin/products'),
  create:       (data)       => api.post('/admin/products', data),
  update:       (id, data)   => api.put(`/admin/products/${id}`, data),
  delete:       (id)         => api.delete(`/admin/products/${id}`),
  updateCost:   (id, cost)   => api.patch(`/admin/products/${id}/cost`, { cost }),
};
