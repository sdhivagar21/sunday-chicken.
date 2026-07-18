import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { OrderCard } from '@/components/orders';
import { EmptyState, OrderCardSkeleton } from '@/components/ui';
import { useMyOrders } from '@/hooks/useOrders';

export default function MyOrdersPage() {
  const { orders, loading } = useMyOrders();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="container-app py-8 max-w-xl mx-auto">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="section-title mb-6"
        >
          My Orders
        </motion.h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            subtitle="Your order history will appear here once you place your first order."
            actionLabel="Order Now"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
