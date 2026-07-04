import api from './api';

export const orderService = {
  create:         (data)          => api.post('/orders', data),
  getMyOrders:    ()              => api.get('/orders/my'),
  getById:        (id)            => api.get(`/orders/${id}`),
  // Admin
  getAll:         (params)        => api.get('/admin/orders', { params }),
  accept:         (id)            => api.patch(`/admin/orders/${id}/accept`),
  reject:         (id)            => api.patch(`/admin/orders/${id}/reject`),
  updateStatus:   (id, status)    => api.patch(`/admin/orders/${id}/status`, { status }),
  updateETA:      (id, eta)       => api.patch(`/admin/orders/${id}/eta`, { eta }),
};
