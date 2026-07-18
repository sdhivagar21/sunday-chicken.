import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Phone, Package, MessageCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button, Spinner } from '@/components/ui';
import { useOrder } from '@/hooks/useOrders';
import { formatPrice, shortOrderId, formatDate } from '@/utils';

const ADMIN_PHONE        = '6383174213';
const ADMIN_PHONE_DISPLAY = '+91 63831 74213';
const ADMIN_WHATSAPP     = '916383174213';

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

  const items = order.items || order.order_items || [];

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
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-14 h-14 text-green-500" strokeWidth={1.5} />
          </div>
          <h1 className="font-poppins font-bold text-2xl text-accent">Order Confirmed! 🎉</h1>
          <p className="text-gray-400 text-sm mt-2">
            We've received your order and will start preparing it shortly.
          </p>
        </motion.div>

        {/* Order info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-card p-6 mb-4"
        >
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-xs text-gray-400">Order ID</p>
              <p className="font-poppins font-bold text-lg text-accent">
                {shortOrderId(order.order_number || order.id)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Placed on</p>
              <p className="text-sm font-medium text-accent">{formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* ETA */}
          {order.estimated_delivery ? (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3.5 flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Estimated Delivery Time</p>
                <p className="text-base font-bold text-green-700">{order.estimated_delivery}</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3.5 flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-yellow-700 font-medium">Delivery Time</p>
                <p className="text-sm font-semibold text-yellow-800">
                  Will be confirmed shortly by our team
                </p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package size={12} /> Your Items
            </p>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product_name} ({item.weight_kg}kg × {item.quantity})
                  </span>
                  <span className="font-semibold text-accent">{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-base">
              <span className="text-accent">Total</span>
              <span className="text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Delivery address */}
          <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
            <p className="font-semibold text-gray-700 mb-0.5">Delivery to:</p>
            <p>{order.delivery_address}{order.landmark ? `, ${order.landmark}` : ''}</p>
          </div>
        </motion.div>

        {/* ── ADMIN CONTACT CARD ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-accent text-white rounded-2xl p-5 mb-4"
        >
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
            Need help? Contact us directly
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🐔</span>
            </div>
            <div>
              <p className="font-poppins font-bold text-white">Sunday Chicken</p>
              <p className="text-gray-300 text-sm">{ADMIN_PHONE_DISPLAY}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:+91${ADMIN_PHONE}`}
              className="flex items-center justify-center gap-2 bg-white text-accent font-semibold text-sm py-3 rounded-xl hover:bg-gray-100 transition"
            >
              <Phone size={16} /> Call Us
            </a>
            <a
              href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`Hi, I placed an order ${shortOrderId(order.order_number || order.id)}. Can you confirm the delivery time?`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold text-sm py-3 rounded-xl hover:bg-green-600 transition"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button variant="ghost" size="full" onClick={() => navigate('/profile/orders')}>
            My Orders
          </Button>
          <Button size="full" onClick={() => navigate('/')}>
            Order More 🐔
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
}
