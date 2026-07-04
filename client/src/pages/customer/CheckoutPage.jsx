import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Input, Button, Textarea } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/order.service';
import { formatPrice } from '@/utils';
import { PAYMENT_METHODS } from '@/constants';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, subtotal, deliveryCharge, total, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name:    user?.name || '',
    customer_phone:   user?.phone || '',
    delivery_address: '',
    landmark:         '',
    payment_method:   'cod',
    order_notes:      '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.customer_name.trim())     e.customer_name    = 'Name is required';
    if (!form.customer_phone.match(/^[6-9]\d{9}$/)) e.customer_phone = 'Valid phone number required';
    if (!form.delivery_address.trim())  e.delivery_address = 'Delivery address is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
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
        subtotal,
        delivery_charge: deliveryCharge,
        total_amount:    total,
      };

      const res = await orderService.create(payload);
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-confirmation/${res.data.order.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container-app py-8">
        <h1 className="section-title mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Customer info */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-card"
              >
                <h2 className="font-poppins font-semibold text-base text-accent mb-4">Your Details</h2>
                <div className="space-y-4">
                  <Input label="Full Name" placeholder="Your name" icon={<User size={15} />}
                    value={form.customer_name} onChange={set('customer_name')} error={errors.customer_name} required />
                  <Input label="Phone Number" type="tel" placeholder="10-digit number" icon={<Phone size={15} />}
                    value={form.customer_phone} onChange={set('customer_phone')} error={errors.customer_phone} maxLength={10} required />
                </div>
              </motion.div>

              {/* Delivery */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-card"
              >
                <h2 className="font-poppins font-semibold text-base text-accent mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <Textarea label="Full Address" placeholder="House no, street, area…" rows={2}
                    value={form.delivery_address} onChange={set('delivery_address')} error={errors.delivery_address} required />
                  <Input label="Landmark (optional)" placeholder="Near temple, school…" icon={<MapPin size={15} />}
                    value={form.landmark} onChange={set('landmark')} />
                </div>
              </motion.div>

              {/* Payment */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-6 shadow-card"
              >
                <h2 className="font-poppins font-semibold text-base text-accent mb-4">Payment Method</h2>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, payment_method: pm.id }))}
                      className={`
                        flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                        ${form.payment_method === pm.id
                          ? 'border-primary bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="text-2xl">{pm.icon}</span>
                      <span className="text-sm font-semibold text-accent">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-card"
              >
                <Textarea label="Order Notes (optional)" placeholder="Any special instructions for the order…"
                  icon={<FileText size={15} />} value={form.order_notes} onChange={set('order_notes')} rows={2} />
              </motion.div>

              <Button type="submit" size="full" loading={loading}>
                Place Order · {formatPrice(total)}
              </Button>
            </form>
          </div>

          {/* Order preview */}
          <div>
            <div className="bg-white rounded-2xl shadow-card p-5 sticky top-24">
              <h3 className="font-poppins font-bold text-sm text-accent mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.cartKey} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
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
                <div className="flex justify-between font-bold text-base text-accent pt-1 border-t border-gray-100">
                  <span>Total</span><span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
