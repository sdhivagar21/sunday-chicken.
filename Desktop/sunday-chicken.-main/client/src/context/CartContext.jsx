import { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '@/utils';
import { STORAGE_KEYS, DEFAULT_DELIVERY_CHARGE, PROFIT_PERCENTAGE } from '@/constants';

const CartContext = createContext(null);

const initialState = {
  items: [],
  deliveryCharge: DEFAULT_DELIVERY_CHARGE,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(i => i.cartKey === action.payload.cartKey);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.cartKey === action.payload.cartKey
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.cartKey !== action.payload) };

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.cartKey !== action.payload.cartKey) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.cartKey === action.payload.cartKey ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'HYDRATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

const computeTotals = (items, deliveryCharge) => {
  const subtotal = items.reduce((sum, item) => {
    const cost     = item.costPerKg * item.weightKg;
    const profit   = cost * (PROFIT_PERCENTAGE / 100);
    return sum + (cost + profit) * item.quantity;
  }, 0);
  const total = subtotal + deliveryCharge;
  return { subtotal: parseFloat(subtotal.toFixed(2)), total: parseFloat(total.toFixed(2)) };
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = storage.get(STORAGE_KEYS.CART);
    if (saved) dispatch({ type: 'HYDRATE', payload: saved });
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    storage.set(STORAGE_KEYS.CART, state);
  }, [state]);

  const { subtotal, total } = computeTotals(state.items, state.deliveryCharge);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      deliveryCharge: state.deliveryCharge,
      subtotal,
      total,
      itemCount,
      dispatch,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
