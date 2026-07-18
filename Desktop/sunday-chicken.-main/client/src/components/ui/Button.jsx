import { motion } from 'framer-motion';

const variants = {
  primary:   'bg-primary text-white shadow-button hover:bg-red-700 disabled:bg-red-300',
  secondary: 'bg-secondary text-accent hover:bg-yellow-400 disabled:bg-yellow-200',
  ghost:     'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  danger:    'bg-red-600 text-white hover:bg-red-700',
  white:     'bg-white text-primary border border-gray-200 hover:border-primary',
};

const sizes = {
  sm:   'py-1.5 px-3 text-xs',
  md:   'py-2.5 px-5 text-sm',
  lg:   'py-3 px-7 text-base',
  full: 'py-3 px-7 text-base w-full',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  onClick,
  type = 'button',
  className = '',
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-button
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary/40
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
