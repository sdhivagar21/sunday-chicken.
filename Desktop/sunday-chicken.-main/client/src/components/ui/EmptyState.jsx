import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({ icon = '📭', title, subtitle, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="font-poppins font-semibold text-lg text-accent mb-2">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm max-w-xs">{subtitle}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">{actionLabel}</Button>
      )}
    </motion.div>
  );
}
