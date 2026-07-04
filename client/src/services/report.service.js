import api from './api';

export const reportService = {
  daily:   (date)         => api.get(`/admin/reports/daily?date=${date}`),
  weekly:  (startDate)    => api.get(`/admin/reports/weekly?start=${startDate}`),
  monthly: (month, year)  => api.get(`/admin/reports/monthly?month=${month}&year=${year}`),
  summary: ()             => api.get('/admin/reports/summary'),
};
