import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils';
import { PROFIT_PERCENTAGE } from '@/constants';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { dispatch, items } = useCart();
  const [adding, setAdding] = useState(false);

  const { id, name, description, cost_per_kg, image_url, is_available } = product;

  // Selling price per kg (cost + 10% profit)
  const sellingPricePerKg = cost_per_kg * (1 + PROFIT_PERCENTAGE / 100);
  const cartKey = `${id}-1`; // default 1kg for quick-add
  const inCart  = items.some(i => i.productId === id);

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    if (!is_available) return;
    setAdding(true);
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        cartKey,
        productId:   id,
        name,
        costPerKg:   cost_per_kg,
        weightKg:    1,
        weightLabel: '1 kg',
        image_url,
      },
    });
    toast.success(`${name} added to cart!`, { icon: '🐔' });
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => navigate(`/products/${id}`)}
      className="card cursor-pointer group"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-red-50">🐔</div>
        )}
        {!is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-pill">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-poppins font-semibold text-sm text-accent leading-snug mb-1 line-clamp-1">
          {name}
        </h3>
        {description && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-accent">
              {formatPrice(sellingPricePerKg)}
              <span className="text-xs font-normal text-gray-400"> /kg</span>
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickAdd}
            disabled={!is_available || adding}
            className={`
              flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-button
              transition-all duration-200
              ${is_available
                ? inCart
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-primary text-white hover:bg-red-700 shadow-button'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {inCart ? <ShoppingCart size={13} /> : <Plus size={13} />}
            {inCart ? 'In Cart' : 'Add'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
