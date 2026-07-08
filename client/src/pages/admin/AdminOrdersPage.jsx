import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Phone, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { AdminLayout } from '@/components/layout';
import { Spinner, OrderStatusBadge } from '@/components/ui';
import { orderService } from '@/services/order.service';
import { formatPrice, formatDate, shortOrderId } from '@/utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'received',         label: '📦 Order Received' },
  { value: 'preparing',        label: '🔪 Preparing'      },
  { value: 'packed',           label: '📫 Packed'         },
  { value: 'out_for_delivery', label: '🛵 Out for Delivery'},
  { value: 'delivered',        label: '✅ Delivered'       },
];

const ETA_OPTIONS = ['20 Minutes','30 Minutes','40 Minutes','45 Minutes','1 Hour','1.5 Hours'];

export default function AdminOrdersPage() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState(null);
  const [etaInputs,  setEtaInputs]  = useState({});
  const [updating,   setUpdating]   = useState({});

  useEffect(() => {
    orderService.getAll()
      .then(res => setOrders(res?.data?.orders || res?.orders || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    orderService.getAll()
      .then(res => setOrders(res?.data?.orders || res?.orders || []));
  };

  const setUpdatingKey = (id, val) => setUpdating(u => ({ ...u, [id]: val }));

  const handleAccept = async (order) => {
    const eta = etaInputs[order.id] || '40 Minutes';
    setUpdatingKey(order.id, 'accept');
    try {
      await orderService.accept(order.id, { estimated_delivery: eta });
      toast.success(`Order accepted — ETA: ${eta} ✅`);
      refresh();
    } catch { toast.error('Failed to accept'); }
    finally { setUpdatingKey(order.id, null); }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this order?')) return;
    setUpdatingKey(id, 'reject');
    try {
      await orderService.reject(id, { admin_note: 'Rejected by admin' });
      toast.success('Order rejected');
      refresh();
    } catch { toast.error('Failed to reject'); }
    finally { setUpdatingKey(id, null); }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingKey(id, 'status');
    try {
      await orderService.updateStatus(id, status);
      setOrders(os => os.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Status updated ✅');
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingKey(id, null); }
  };

  const handleEtaUpdate = async (id) => {
    const eta = etaInputs[id];
    if (!eta) { toast.error('Enter delivery time'); return; }
    setUpdatingKey(id, 'eta');
    try {
      await orderService.updateETA(id, eta);
      setOrders(os => os.map(o => o.id === id ? { ...o, estimated_delivery: eta } : o));
      toast.success(`ETA updated: ${eta} ✅`);
    } catch { toast.error('Failed to update ETA'); }
    finally { setUpdatingKey(id, null); }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-accent">Orders</h1>
          <p className="text-sm text-gray-400">{orders.length} total orders</p>
        </div>
        <button onClick={refresh} className="text-sm text-primary font-medium hover:underline">
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p className="font-medium">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isExpanded  = expanded === order.id;
            const isUpdating  = updating[order.id];
            const items       = order.items || [];

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-poppins font-bold text-accent">
                          {shortOrderId(order.order_number || order.id)}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{order.customer_name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Phone size={11} />
                        <a
                          href={`tel:${order.customer_phone}`}
                          onClick={e => e.stopPropagation()}
                          className="text-primary font-medium hover:underline"
                        >
                          {order.customer_phone}
                        </a>
                        <span className="mx-1">·</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-accent">{formatPrice(order.total_amount)}</p>
                      <p className="text-xs text-gray-400 capitalize">{order.payment_method}</p>
                      {isExpanded
                        ? <ChevronUp size={16} className="text-gray-400 ml-auto mt-1" />
                        : <ChevronDown size={16} className="text-gray-400 ml-auto mt-1" />
                      }
                    </div>
                  </div>

                  {/* ETA preview */}
                  {order.estimated_delivery && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <Clock size={12} /> ETA: {order.estimated_delivery}
                    </div>
                  )}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4">

                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                      <MapPin size={14} className="mt-0.5 text-primary flex-shrink-0" />
                      <span>
                        {order.delivery_address}
                        {order.landmark ? `, ${order.landmark}` : ''}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</p>
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.product_name} · {item.weight_kg}kg × {item.quantity}
                          </span>
                          <span className="font-semibold">{formatPrice(item.line_total)}</span>
                        </div>
                      ))}
                      {item?.special_instruction && (
                        <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1 mt-1">
                          📝 {items[0]?.special_instruction}
                        </p>
                      )}
                    </div>

                    {order.order_notes && (
                      <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-800">
                        📝 <span className="font-medium">Note:</span> {order.order_notes}
                      </div>
                    )}

                    {/* ── DELIVERY TIME SETTER ── */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                        <Clock size={14} className="text-blue-500" />
                        Set / Update Delivery Time
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ETA_OPTIONS.map(opt => (
                          <button
                            key={opt}
                            onClick={() => setEtaInputs(e => ({ ...e, [order.id]: opt }))}
                            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                              etaInputs[order.id] === opt
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={etaInputs[order.id] || ''}
                          onChange={e => setEtaInputs(i => ({ ...i, [order.id]: e.target.value }))}
                          placeholder="Or type custom e.g. 25 Minutes"
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => handleEtaUpdate(order.id)}
                          disabled={!!isUpdating}
                          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {isUpdating === 'eta' ? '...' : 'Set'}
                        </button>
                      </div>
                    </div>

                    {/* ── STATUS UPDATE ── */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Update Status
                      </p>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        disabled={!!isUpdating || order.status === 'rejected'}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* ── ACCEPT / REJECT (new orders only) ── */}
                    {order.status === 'received' && (
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => handleAccept(order)}
                          disabled={!!isUpdating}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          {isUpdating === 'accept' ? 'Accepting…' : `Accept (ETA: ${etaInputs[order.id] || '40 Minutes'})`}
                        </button>
                        <button
                          onClick={() => handleReject(order.id)}
                          disabled={!!isUpdating}
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 font-semibold px-4 py-3 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          {isUpdating === 'reject' ? '…' : 'Reject'}
                        </button>
                      </div>
                    )}

                    {/* Call customer button */}
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition text-sm"
                    >
                      <Phone size={15} /> Call Customer ({order.customer_phone})
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
