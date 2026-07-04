import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Package } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button, Spinner } from '@/components/ui';
import { OrderStatusStepper } from '@/components/orders';
import { useOrder } from '@/hooks/useOrders';
import { formatPrice, shortOrderId, formatDate } from '@/utils';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const { order, loading } = useOrder(orderId);

  if (loading) return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    </MainLayout>
  );

  if (!order) return (
    <MainLayout>
      <div className="container-app py-20 text-center">
        <p className="text-gray-400">Order not found.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container-app py-10 max-w-xl mx-auto">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="text-center mb-8"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="font-poppins font-bold text-2xl text-accent">Order Confirmed!</h1>
          <p className="text-gray-400 text-sm mt-2">We've received your order and are getting it ready.</p>
        </motion.div>

        {/* Order info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-card p-6 mb-5"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-400">Order ID</p>
              <p className="font-poppins font-bold text-lg text-accent">{shortOrderId(order.order_number || order.id)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Placed on</p>
              <p className="text-sm font-medium text-accent">{formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* ETA */}
          {order.estimated_delivery && (
            <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2.5 mb-4">
              <Clock size={18} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-600 font-medium">Estimated Delivery</p>
                <p className="text-sm font-bold text-green-700">{order.estimated_delivery}</p>
              </div>
            </div>
          )}

          {/* Status stepper */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package size={12} /> Order Status
            </p>
            <OrderStatusStepper currentStatus={order.status} />
          </div>

          {/* Items */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            {order.order_items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.product_name} ({item.weight_kg}kg × {item.quantity})</span>
                <span className="font-medium text-accent">{formatPrice(item.line_total)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base text-accent">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" size="full" onClick={() => navigate(`/orders/${orderId}`)}>
            Track Order
          </Button>
          <Button size="full" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
