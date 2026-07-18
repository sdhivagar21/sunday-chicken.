import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock } from 'lucide-react';
import { OrderStatusBadge } from '@/components/ui';
import { formatPrice, formatDate, shortOrderId } from '@/utils';

export default function OrderCard({ order }) {
  const navigate = useNavigate();
  const { id, order_number, status, total_amount, created_at, estimated_delivery, order_items } = order;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => navigate(`/orders/${id}`)}
      className="card p-4 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-poppins font-bold text-sm text-accent">{shortOrderId(order_number || id)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={status} />
          <ChevronRight size={16} className="text-gray-300" />
        </div>
      </div>

      {order_items?.length > 0 && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
          {order_items.map(i => `${i.product_name} (${i.weight_kg}kg)`).join(' · ')}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="font-bold text-sm text-accent">{formatPrice(total_amount)}</span>
        {estimated_delivery && status !== 'delivered' && status !== 'rejected' && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <Clock size={11} /> ETA {estimated_delivery}
          </span>
        )}
      </div>
    </motion.div>
  );
}
