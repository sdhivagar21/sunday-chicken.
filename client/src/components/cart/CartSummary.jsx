import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/utils';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function CartSummary() {
  const { subtotal, deliveryCharge, total, items } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (!items.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
      <h3 className="font-poppins font-bold text-base text-accent">Order Summary</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-accent">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery charge</span>
          <span className="font-medium text-accent">{formatPrice(deliveryCharge)}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-accent">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>

      <Button
        size="full"
        onClick={handleCheckout}
        icon={<ShoppingBag size={16} />}
      >
        Proceed to Checkout
      </Button>

      <p className="text-center text-xs text-gray-400">
        Includes 10% profit margin · Delivery ₹{deliveryCharge}
      </p>
    </div>
  );
}
