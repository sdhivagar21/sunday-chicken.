import { motion } from 'framer-motion';

export default function CategoryChip({ category, active = false, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-medium
        border transition-all duration-200
        ${active
          ? 'bg-primary text-white border-primary shadow-button'
          : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
        }
      `}
    >
      {category.image_url && (
        <img src={category.image_url} alt="" className="w-5 h-5 rounded-full object-cover" />
      )}
      {category.name}
    </motion.button>
  );
}
