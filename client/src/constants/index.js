export const APP_NAME = 'Sunday Chicken';
export const APP_TAGLINE = 'Currently Serving Sivakasi Only';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';

export const WEIGHT_OPTIONS = [
  { label: '500g', value: 0.5 },
  { label: '750g', value: 0.75 },
  { label: '1 kg', value: 1 },
  { label: '1.5 kg', value: 1.5 },
  { label: '2 kg', value: 2 },
  { label: 'Custom', value: 'custom' },
];

export const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { id: 'upi', label: 'UPI Payment', icon: '📱' },
];

export const ORDER_STATUSES = [
  { id: 'received',         label: 'Order Received',   color: 'blue',   step: 1 },
  { id: 'preparing',        label: 'Preparing',         color: 'yellow', step: 2 },
  { id: 'packed',           label: 'Packed',            color: 'orange', step: 3 },
  { id: 'out_for_delivery', label: 'Out for Delivery',  color: 'purple', step: 4 },
  { id: 'delivered',        label: 'Delivered',         color: 'green',  step: 5 },
];

export const INSTRUCTION_SUGGESTIONS = [
  'Remove skin', 'Small pieces', 'Medium pieces',
  'Separate liver', 'Keep legs whole', 'Clean thoroughly', 'Cut into curry pieces',
];

export const DEFAULT_DELIVERY_CHARGE = 30;
export const PROFIT_PERCENTAGE = 10;

export const ROUTES = {
  HOME:            '/',
  PRODUCTS:        '/products',
  PRODUCT_DETAIL:  '/products/:id',
  CART:            '/cart',
  CHECKOUT:        '/checkout',
  ORDER_CONFIRM:   '/order-confirmation/:orderId',
  ORDER_STATUS:    '/orders/:orderId',
  PROFILE:         '/profile',
  ORDERS:          '/profile/orders',
  LOGIN:           '/login',
  REGISTER:        '/register',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS:  '/admin/products',
  ADMIN_ORDERS:    '/admin/orders',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_REPORTS:   '/admin/reports',
  ADMIN_SETTINGS:  '/admin/settings',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sc_auth_token',
  USER:       'sc_user',
  CART:       'sc_cart',
};
