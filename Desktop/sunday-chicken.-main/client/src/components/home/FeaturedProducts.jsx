import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products';

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const { products, loading } = useProducts({ featured: true, limit: 4 });

  return (
    <section className="container-app py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="section-title">Featured Cuts</h2>
          <p className="text-gray-400 text-sm mt-1">Our most popular selections</p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-red-700 transition-colors"
        >
          See all <ArrowRight size={15} />
        </button>
      </div>

      <ProductGrid products={products} loading={loading} />
    </section>
  );
}
