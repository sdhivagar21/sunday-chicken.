import api from './api';

export const categoryService = {
  getAll:  ()         => api.get('/categories'),
  create:  (data)     => api.post('/admin/categories', data),
  update:  (id, data) => api.put(`/admin/categories/${id}`, data),
  delete:  (id)       => api.delete(`/admin/categories/${id}`),
};
