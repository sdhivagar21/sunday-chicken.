import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button, Skeleton, Textarea } from '@/components/ui';
import { InstructionSuggestions } from '@/components/checkout';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { formatPrice, calculateSellingPrice } from '@/utils';
import { WEIGHT_OPTIONS, PROFIT_PERCENTAGE } from '@/constants';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const { product, loading, error } = useProduct(id);

  const [selectedWeight, setSelectedWeight] = useState(WEIGHT_OPTIONS[2]); // default 1kg
  const [customWeight, setCustomWeight]      = useState('');
  const [quantity, setQuantity]              = useState(1);
  const [instruction, setInstruction]        = useState('');

  if (loading) return (
    <MainLayout>
      <div className="container-app py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    </MainLayout>
  );

  if (error || !product) return (
    <MainLayout>
      <div className="container-app py-20 text-center">
        <p className="text-gray-400">Product not found.</p>
        <Button className="mt-4" onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    </MainLayout>
  );

  const { name, description, cost_per_kg, image_url, is_available } = product;

  const weightKg = selectedWeight.value === 'custom'
    ? parseFloat(customWeight) || 0
    : selectedWeight.value;

  const { total: lineTotal } = calculateSellingPrice(cost_per_kg, weightKg, 0);
  const sellingPerKg = cost_per_kg * (1 + PROFIT_PERCENTAGE / 100);

  const handleAddToCart = () => {
    if (!is_available) return;
    if (selectedWeight.value === 'custom' && (!customWeight || parseFloat(customWeight) <= 0)) {
      toast.error('Please enter a valid weight');
      return;
    }

    const cartKey = `${id}-${weightKg}-${Date.now()}`;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        cartKey,
        productId:   id,
        name,
        costPerKg:   cost_per_kg,
        weightKg,
        weightLabel: selectedWeight.value === 'custom' ? `${weightKg}kg` : selectedWeight.label,
        quantity,
        image_url,
        instruction,
      },
    });
    toast.success(`${name} (${selectedWeight.value === 'custom' ? `${weightKg}kg` : selectedWeight.label}) added!`, { icon: '🐔' });
    navigate('/cart');
  };

  return (
    <MainLayout>
      <div className="container-app py-6 md:py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden aspect-square bg-red-50"
          >
            {image_url
              ? <img src={image_url} alt={name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-[120px]">🐔</div>
            }
            {!is_available && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg bg-black/50 px-5 py-2 rounded-full">Out of Stock</span>
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="font-poppins font-bold text-2xl md:text-3xl text-accent mb-2">{name}</h1>
            {description && <p className="text-gray-500 text-sm leading-relaxed mb-5">{description}</p>}

            <div className="mb-6">
              <span className="text-2xl font-bold text-primary">{formatPrice(sellingPerKg)}</span>
              <span className="text-gray-400 text-sm ml-1">/ kg</span>
            </div>

            {/* Weight selector */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-accent mb-2">Select Weight</label>
              <div className="grid grid-cols-3 gap-2">
                {WEIGHT_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedWeight(opt)}
                    className={`
                      py-2.5 px-2 rounded-xl border text-sm font-semibold transition-all
                      ${selectedWeight.label === opt.label
                        ? 'bg-primary text-white border-primary shadow-button'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {selectedWeight.value === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <input
                      type="number"
                      placeholder="Enter weight in kg (e.g. 1.2)"
                      value={customWeight}
                      onChange={e => setCustomWeight(e.target.value)}
                      min="0.1" step="0.1"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quantity */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-accent mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                >
                  <Minus size={15} />
                </button>
                <span className="text-lg font-bold text-accent w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Special instructions */}
            <div className="mb-6">
              <Textarea
                label="Special Instructions"
                placeholder="e.g. Remove skin, small pieces, separate liver…"
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                rows={3}
                hint="Tell us exactly how you want your chicken prepared."
              />
              <InstructionSuggestions value={instruction} onChange={setInstruction} />
            </div>

            {/* Price + Add */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-5">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>{formatPrice(sellingPerKg)} × {weightKg || 0}kg × {quantity}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-accent">
                <span>Total</span>
                <span className="text-primary">{formatPrice(lineTotal * quantity)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">+ delivery charge at checkout</p>
            </div>

            <Button
              size="full"
              disabled={!is_available}
              onClick={handleAddToCart}
              icon={<ShoppingCart size={18} />}
            >
              {is_available ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
