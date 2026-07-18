import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { ProductGrid, CategoryChip } from '@/components/products';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { debounce } from '@/utils';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch]   = useState('');
  const activeCat = searchParams.get('category') || '';

  const { categories } = useCategories();
  const { products, loading } = useProducts({
    category: activeCat || undefined,
    search:   search    || undefined,
  });

  const handleSearch = debounce((val) => setSearch(val), 350);

  const selectCategory = (id) => {
    if (id) setSearchParams({ category: id });
    else    setSearchParams({});
  };

  return (
    <MainLayout>
      <div className="container-app py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="section-title">Our Products</h1>
          <p className="text-gray-400 text-sm mt-1">Farm-fresh chicken, every day</p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products…"
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100 transition-all"
          />
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
            <CategoryChip
              category={{ id: '', name: 'All' }}
              active={!activeCat}
              onClick={() => selectCategory('')}
            />
            {categories.map(cat => (
              <CategoryChip
                key={cat.id}
                category={cat}
                active={activeCat === cat.id}
                onClick={() => selectCategory(cat.id)}
              />
            ))}
          </div>
        )}

        {/* Grid */}
        <ProductGrid products={products} loading={loading} emptyMessage="No products found" />
      </div>
    </MainLayout>
  );
}
