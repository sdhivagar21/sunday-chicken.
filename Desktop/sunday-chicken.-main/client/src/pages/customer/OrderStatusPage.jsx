import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, RefreshCw } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button, Spinner, OrderStatusBadge } from '@/components/ui';
import { OrderStatusStepper } from '@/components/orders';
import { useOrder } from '@/hooks/useOrders';
import { formatPrice, shortOrderId, formatDate } from '@/utils';

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const { order, loading, refetch } = useOrder(orderId);

  if (loading) return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>
    </MainLayout>
  );

  if (!order) return (
    <MainLayout>
      <div className="container-app py-20 text-center">
        <p className="text-gray-400">Order not found.</p>
        <Button className="mt-4" onClick={() => navigate('/profile/orders')}>My Orders</Button>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container-app py-8 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">Track Order</h1>
            <p className="text-sm text-gray-400 mt-0.5">{shortOrderId(order.order_number || order.id)}</p>
          </div>
          <button onClick={refetch} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* ETA */}
        {order.estimated_delivery && order.status !== 'delivered' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 mb-6"
          >
            <Clock size={22} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-green-600 font-medium">Estimated Delivery</p>
              <p className="text-lg font-bold text-green-700">{order.estimated_delivery}</p>
            </div>
          </motion.div>
        )}

        {/* Status card */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-accent">Current Status</p>
            <OrderStatusBadge status={order.status} />
          </div>
          <OrderStatusStepper currentStatus={order.status} />
        </div>

        {/* Order details */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-5">
          <h3 className="font-poppins font-semibold text-sm text-accent mb-4">Order Details</h3>
          <div className="space-y-2 mb-4">
            {order.order_items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.product_name} ({item.weight_kg}kg × {item.quantity})</span>
                <span className="font-medium">{formatPrice(item.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Delivery</span><span>{formatPrice(order.delivery_charge)}</span>
            </div>
            <div className="flex justify-between font-bold text-accent">
              <span>Total</span><span className="text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Delivering to</p>
          <p className="text-sm text-accent font-medium">{order.customer_name}</p>
          <p className="text-sm text-gray-500 mt-0.5">{order.delivery_address}</p>
          {order.landmark && <p className="text-xs text-gray-400 mt-0.5">Near: {order.landmark}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" size="full" onClick={() => navigate('/profile/orders')}>All Orders</Button>
          <Button size="full" onClick={() => navigate('/products')}>Order Again</Button>
        </div>
      </div>
    </MainLayout>
  );
}
