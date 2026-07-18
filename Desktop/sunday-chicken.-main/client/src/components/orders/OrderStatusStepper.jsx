import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ORDER_STATUSES } from '@/constants';

export default function OrderStatusStepper({ currentStatus }) {
  const currentStep = ORDER_STATUSES.find(s => s.id === currentStatus)?.step ?? 0;

  return (
    <div className="py-4">
      <div className="flex items-start justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 z-0 mx-8" />
        <motion.div
          className="absolute top-4 left-0 h-0.5 bg-primary z-0 mx-8"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep - 1) / (ORDER_STATUSES.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {ORDER_STATUSES.map((s) => {
          const done   = s.step < currentStep;
          const active = s.step === currentStep;
          return (
            <div key={s.id} className="flex flex-col items-center z-10 flex-1">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: active ? 1.15 : 1 }}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                  ${done   ? 'bg-primary border-primary text-white'           : ''}
                  ${active ? 'bg-primary border-primary text-white shadow-button' : ''}
                  ${!done && !active ? 'bg-white border-gray-200 text-gray-300' : ''}
                `}
              >
                {done ? <Check size={14} strokeWidth={3} /> : <span className="text-[10px] font-bold">{s.step}</span>}
              </motion.div>
              <span className={`text-[10px] mt-1.5 font-medium text-center leading-tight max-w-[60px] ${active ? 'text-primary' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
