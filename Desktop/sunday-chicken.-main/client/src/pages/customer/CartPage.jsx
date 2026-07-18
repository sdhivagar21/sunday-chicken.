import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { CartItem, CartSummary } from '@/components/cart';
import { EmptyState, Button } from '@/components/ui';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, dispatch } = useCart();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="container-app py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title">Your Cart</h1>
          {items.length > 0 && (
            <button
              onClick={() => dispatch({ type: 'CLEAR_CART' })}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            subtitle="Add some fresh chicken to get started."
            actionLabel="Browse Products"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map(item => <CartItem key={item.cartKey} item={item} />)}
              </AnimatePresence>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                <Button variant="ghost" size="md" onClick={() => navigate('/products')}>
                  + Add more items
                </Button>
              </motion.div>
            </div>

            {/* Summary */}
            <div>
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
