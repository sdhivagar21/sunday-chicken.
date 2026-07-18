import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui';

const FALLBACK_ICONS = ['🍗', '🥩', '🍖', '🫀', '🦴', '🥚'];

export default function CategorySection() {
  const { categories, loading } = useCategories();
  const navigate = useNavigate();

  return (
    <section className="container-app py-10">
      <div className="mb-6">
        <h2 className="section-title">Shop by Category</h2>
        <p className="text-gray-400 text-sm mt-1">Pick your favourite cut</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <Skeleton className="w-14 h-3" />
              </div>
            ))
          : categories.map((cat, idx) => (
              <motion.button
                key={cat.id}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-red-50 transition-colors group"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-50 group-hover:bg-red-100 transition-colors flex items-center justify-center text-3xl overflow-hidden">
                  {cat.image_url
                    ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover rounded-2xl" />
                    : <span>{FALLBACK_ICONS[idx % FALLBACK_ICONS.length]}</span>
                  }
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-primary transition-colors text-center leading-tight">
                  {cat.name}
                </span>
              </motion.button>
            ))
        }
      </div>
    </section>
  );
}
