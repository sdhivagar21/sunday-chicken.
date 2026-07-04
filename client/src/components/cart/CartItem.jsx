import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils';
import { PROFIT_PERCENTAGE } from '@/constants';

export default function CartItem({ item }) {
  const { dispatch } = useCart();

  const { cartKey, name, costPerKg, weightKg, weightLabel, quantity, image_url } = item;

  const linePrice = costPerKg * weightKg * (1 + PROFIT_PERCENTAGE / 100) * quantity;

  const updateQty = (delta) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartKey, quantity: quantity + delta } });
  };

  const remove = () => dispatch({ type: 'REMOVE_ITEM', payload: cartKey });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 bg-white rounded-2xl p-3 shadow-card"
    >
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-red-50">
        {image_url
          ? <img src={image_url} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-3xl">🐔</div>
        }
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-poppins font-semibold text-sm text-accent line-clamp-1">{name}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{weightLabel}</p>

        <div className="flex items-center justify-between mt-2.5">
          {/* Qty controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQty(-1)}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm font-semibold text-accent w-5 text-center">{quantity}</span>
            <button
              onClick={() => updateQty(1)}
              className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Price + delete */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-accent">{formatPrice(linePrice)}</span>
            <button
              onClick={remove}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
