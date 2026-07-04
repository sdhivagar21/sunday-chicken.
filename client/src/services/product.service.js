import api from './api';

export const productService = {
  getAll:     (params)     => api.get('/products', { params }),
  getById:    (id)         => api.get(`/products/${id}`),
  getByCategory: (catId)  => api.get(`/products?category=${catId}`),
  getFeatured: ()          => api.get('/products?featured=true'),
  // Admin
  create:     (data)       => api.post('/admin/products', data),
  update:     (id, data)   => api.put(`/admin/products/${id}`, data),
  delete:     (id)         => api.delete(`/admin/products/${id}`),
  updateCost: (id, cost)   => api.patch(`/admin/products/${id}/cost`, { cost }),
};
