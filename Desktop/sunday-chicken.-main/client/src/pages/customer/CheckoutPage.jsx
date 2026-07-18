import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, User, FileText, ShoppingBag } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button, EmptyState } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/order.service';
import { formatPrice } from '@/utils';
import { PAYMENT_METHODS } from '@/constants';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, subtotal, deliveryCharge, total, dispatch } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    customer_name:    user?.name  || '',
    customer_phone:   user?.phone || '',
    delivery_address: '',
    landmark:         '',
    payment_method:   'cod',
    order_notes:      '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.customer_name.trim())    e.customer_name    = 'Name is required';
    if (!form.customer_phone.trim())   e.customer_phone   = 'Phone is required';
    if (form.customer_phone.replace(/\D/g,'').length < 10)
                                       e.customer_phone   = 'Enter valid 10-digit number';
    if (!form.delivery_address.trim()) e.delivery_address = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fill required fields'); return; }
    if (!items.length) { toast.error('Your cart is empty'); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        items: items.map(i => ({
          product_id:          i.productId,
          product_name:        i.name,
          cost_per_kg:         i.costPerKg,
          weight_kg:           i.weightKg,
          quantity:            i.quantity,
          special_instruction: i.instruction || '',
        })),
      };
      const res     = await orderService.create(payload);
      const orderId = res?.data?.order?.id || res?.order?.id;
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Order placed! 🎉');
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <MainLayout>
        <EmptyState icon="🛒" title="Cart is empty"
          subtitle="Add some fresh chicken first!"
          actionLabel="Browse Products" onAction={() => navigate('/products')} />
      </MainLayout>
    );
  }

  const Field = ({ label, error, required, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">⚠ {error}</p>}
    </div>
  );

  const inputCls = (err) =>
    `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all
     ${err ? 'border-red-400 focus:ring-2 focus:ring-red-100'
           : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-red-100'}`;

  return (
    <MainLayout>
      <div className="container-app py-8 max-w-5xl">
        <h1 className="font-poppins font-bold text-2xl text-accent mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Form ── */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">

            {/* Guest notice */}
            {!user && (
              <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }}
                className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800"
              >
                <span className="font-semibold">👋 Ordering as guest</span> —
                fill your details below and place the order.{' '}
                <Link to="/login" className="underline font-semibold">Login</Link>{' '}
                to track orders later (optional).
              </motion.div>
            )}

            {/* Personal Details */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              className="bg-white rounded-2xl p-6 shadow-card"
            >
              <h2 className="font-poppins font-semibold text-base mb-4 flex items-center gap-2">
                <User size={16} className="text-primary" /> Your Details
              </h2>
              <div className="space-y-4">
                <Field label="Full Name" error={errors.customer_name} required>
                  <input type="text" value={form.customer_name}
                    onChange={set('customer_name')} placeholder="Your full name"
                    className={inputCls(errors.customer_name)} />
                </Field>
                <Field label="WhatsApp / Phone Number" error={errors.customer_phone} required>
                  <input type="tel" value={form.customer_phone}
                    onChange={set('customer_phone')} placeholder="10-digit number"
                    maxLength={10} className={inputCls(errors.customer_phone)} />
                  <p className="text-xs text-gray-400 mt-1">
                    📱 Order confirmation will be sent to this WhatsApp number
                  </p>
                </Field>
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
              className="bg-white rounded-2xl p-6 shadow-card"
            >
              <h2 className="font-poppins font-semibold text-base mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Delivery Address
              </h2>
              <div className="space-y-4">
                <Field label="Full Address" error={errors.delivery_address} required>
                  <textarea value={form.delivery_address}
                    onChange={set('delivery_address')}
                    placeholder="House no, street, area — Sivakasi..."
                    rows={3} className={inputCls(errors.delivery_address) + ' resize-none'} />
                </Field>
                <Field label="Landmark (optional)">
                  <input type="text" value={form.landmark}
                    onChange={set('landmark')} placeholder="Near temple, bus stop, school..."
                    className={inputCls(false)} />
                </Field>
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
              className="bg-white rounded-2xl p-6 shadow-card"
            >
              <h2 className="font-poppins font-semibold text-base mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.id} type="button"
                    onClick={() => setForm(f => ({ ...f, payment_method: pm.id }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                      ${form.payment_method === pm.id
                        ? 'border-primary bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <span className="text-2xl">{pm.icon}</span>
                    <span className="text-sm font-semibold text-accent">{pm.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Notes */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
              className="bg-white rounded-2xl p-6 shadow-card"
            >
              <h2 className="font-poppins font-semibold text-base mb-3 flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Order Notes
                <span className="text-gray-400 font-normal text-sm">(optional)</span>
              </h2>
              <textarea value={form.order_notes} onChange={set('order_notes')}
                placeholder="Small pieces, remove skin, separate liver..."
                rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100 resize-none transition-all" />
            </motion.div>

            <Button type="submit" size="full" loading={loading} icon={<ShoppingBag size={18} />}>
              {loading ? 'Placing Order…' : `Place Order · ${formatPrice(total)}`}
            </Button>
          </form>

          {/* ── Right: Summary ── */}
          <div>
            <div className="bg-white rounded-2xl shadow-card p-5 sticky top-24">
              <h3 className="font-poppins font-bold text-sm text-accent mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.cartKey} className="flex justify-between text-sm gap-2">
                    <span className="text-gray-600 line-clamp-2 flex-1">
                      {item.name} ({item.weightLabel}) × {item.quantity}
                    </span>
                    <span className="font-medium text-accent flex-shrink-0">
                      {formatPrice(item.costPerKg * item.weightKg * 1.1 * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span><span>{formatPrice(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-accent pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
