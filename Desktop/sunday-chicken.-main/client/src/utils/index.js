import { PROFIT_PERCENTAGE } from '@/constants';

/**
 * Calculate the selling price from base chicken cost
 * Formula: sellingPrice = chickenCost + (chickenCost * 10%) + deliveryCharge
 */
export const calculateSellingPrice = (chickenCostPerKg, weightKg, deliveryCharge) => {
  const chickenCost = chickenCostPerKg * weightKg;
  const profit = chickenCost * (PROFIT_PERCENTAGE / 100);
  return {
    chickenCost: parseFloat(chickenCost.toFixed(2)),
    profit: parseFloat(profit.toFixed(2)),
    deliveryCharge: parseFloat(deliveryCharge.toFixed(2)),
    total: parseFloat((chickenCost + profit + deliveryCharge).toFixed(2)),
  };
};

/** Format price in Indian Rupees */
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

/** Format date */
export const formatDate = (dateString) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString));

/** Generate a short order display ID */
export const shortOrderId = (id) => (id ? `#${String(id).slice(-6).toUpperCase()}` : '—');

/** Clamp a number between min and max */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/** Truncate text */
export const truncate = (str, maxLength = 80) =>
  str && str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;

/** Get image URL from Cloudinary */
export const getCloudinaryUrl = (publicId, transforms = 'w_600,h_600,c_fill,q_auto,f_auto') =>
  `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${transforms}/${publicId}`;

/** Debounce function */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/** Check if user is admin */
export const isAdmin = (user) => user?.role === 'admin';

/** Storage helpers */
export const storage = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(key); } catch {}
  },
};
