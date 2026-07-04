import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, X, Clock } from 'lucide-react';
import { AdminLayout } from '@/components/layout';
import { OrderStatusBadge, Modal, Button, Spinner } from '@/components/ui';
import { orderService } from '@/services/order.service';
import { ORDER_STATUSES } from '@/constants';
import { formatPrice, shortOrderId, formatDate } from '@/utils';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [etaModal, setEtaModal] = useState(false);
  const [eta, setEta]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(() => {
    setLoading(true);
    orderService.getAll({ status: statusFilter || undefined })
      .then(res  => setOrders(res.data?.orders || []))
      .catch(()  => toast.error('Failed to load orders'))
      .finally(()=> setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status);
      toast.success(`Status updated to "${status}"`);
      fetchOrders();
      setSelected(null);
    } catch { toast.error('Update failed'); }
  };

  const handleETA = async () => {
    if (!eta || !selected) return;
    try {
      await orderService.updateETA(selected.id, eta);
      toast.success(`ETA set to ${eta}`);
      setEtaModal(false); setEta(''); fetchOrders();
    } catch { toast.error('Failed to set ETA'); }
  };

  const handleAccept = async (id) => {
    try { await orderService.accept(id); toast.success('Order accepted'); fetchOrders(); }
    catch { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    try { await orderService.reject(id); toast.success('Order rejected'); fetchOrders(); }
    catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-accent">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} orders</p>
        </div>
        <button onClick={fetchOrders} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <RefreshCw size={17} className={loading ? 'animate-spin text-primary' : 'text-gray-500'} />
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-5">
        {[{ id: '', label: 'All' }, ...ORDER_STATUSES].map(s => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === s.id
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-500 border-gray-200 hover:border-primary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No orders found</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  {['Order', 'Customer', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelected(order)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{shortOrderId(order.order_number || order.id)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-accent">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-accent">{formatPrice(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className="uppercase text-xs font-semibold text-gray-500">{order.payment_method}</span>
                    </td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        {order.status === 'received' && (
                          <>
                            <button onClick={() => handleAccept(order.id)} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"><Check size={13} /></button>
                            <button onClick={() => handleReject(order.id)} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors"><X size={13} /></button>
                          </>
                        )}
                        <button onClick={() => { setSelected(order); setEtaModal(true); }} className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"><Clock size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      <Modal isOpen={!!selected && !etaModal} onClose={() => setSelected(null)} title={`Order ${shortOrderId(selected?.order_number || selected?.id)}`} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-400 text-xs">Customer</p><p className="font-semibold">{selected.customer_name}</p></div>
              <div><p className="text-gray-400 text-xs">Phone</p><p className="font-semibold">{selected.customer_phone}</p></div>
              <div className="col-span-2"><p className="text-gray-400 text-xs">Address</p><p className="font-medium">{selected.delivery_address}</p></div>
              {selected.landmark && <div className="col-span-2"><p className="text-gray-400 text-xs">Landmark</p><p>{selected.landmark}</p></div>}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</p>
              {selected.order_items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700">{item.product_name} · {item.weight_kg}kg × {item.quantity}</span>
                  <span className="font-semibold">{formatPrice(item.line_total)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2">
                <span>Total</span><span className="text-primary">{formatPrice(selected.total_amount)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => updateStatus(selected.id, s.id)}
                    className={`px-3 py-1.5 rounded-pill text-xs font-semibold border transition-all ${
                      selected.status === s.id
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-200 text-gray-600 hover:border-primary'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ETA modal */}
      <Modal isOpen={etaModal} onClose={() => setEtaModal(false)} title="Set Estimated Delivery Time" size="sm">
        <div className="space-y-4">
          <input
            value={eta}
            onChange={e => setEta(e.target.value)}
            placeholder="e.g. 35 Minutes"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100"
          />
          <Button size="full" onClick={handleETA}>Set ETA</Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
