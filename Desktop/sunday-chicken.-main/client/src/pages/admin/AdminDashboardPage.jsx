import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout';
import { OrderStatusBadge, Spinner } from '@/components/ui';
import { reportService } from '@/services/report.service';
import { formatPrice, formatDate, shortOrderId } from '@/utils';

function StatCard({ icon, label, value, color, loading }) {
  const colors = {
    red:    'bg-red-50 text-primary',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue:   'bg-blue-50 text-blue-600',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        {loading
          ? <div className="skeleton h-6 w-20 mt-1" />
          : <p className="font-poppins font-bold text-xl text-accent">{value}</p>
        }
      </div>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.summary()
      .then(res  => setSummary(res.data))
      .catch(()  => {})
      .finally(()=> setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-poppins font-bold text-2xl text-accent">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back — here's today's overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<ShoppingBag size={22} />} label="Today's Orders"   value={summary?.today_orders ?? '—'}          color="red"    loading={loading} />
        <StatCard icon={<DollarSign size={22} />}  label="Today's Revenue"  value={summary ? formatPrice(summary.today_revenue) : '—'} color="green"  loading={loading} />
        <StatCard icon={<Clock size={22} />}        label="Pending Orders"   value={summary?.pending_orders ?? '—'}         color="yellow" loading={loading} />
        <StatCard icon={<CheckCircle size={22} />}  label="Completed Today"  value={summary?.completed_today ?? '—'}        color="blue"   loading={loading} />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="font-poppins font-semibold text-base text-accent mb-4">Recent Orders</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ) : summary?.recent_orders?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Order ID</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.recent_orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs text-gray-500">{shortOrderId(order.order_number || order.id)}</td>
                    <td className="py-3 font-medium text-accent">{order.customer_name}</td>
                    <td className="py-3 font-semibold text-accent">{formatPrice(order.total_amount)}</td>
                    <td className="py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="py-3 text-gray-400 text-xs">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-6">No recent orders</p>
        )}
      </div>
    </AdminLayout>
  );
}
