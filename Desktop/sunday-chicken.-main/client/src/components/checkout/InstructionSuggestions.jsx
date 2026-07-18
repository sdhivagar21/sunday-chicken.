import { motion } from 'framer-motion';
import { INSTRUCTION_SUGGESTIONS } from '@/constants';

export default function InstructionSuggestions({ value, onChange }) {
  const toggleSuggestion = (suggestion) => {
    const current = value || '';
    if (current.includes(suggestion)) {
      onChange(current.replace(suggestion, '').replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim());
    } else {
      onChange(current ? `${current}, ${suggestion}` : suggestion);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {INSTRUCTION_SUGGESTIONS.map((s) => {
        const active = (value || '').includes(s);
        return (
          <motion.button
            key={s}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleSuggestion(s)}
            className={`
              text-xs px-3 py-1.5 rounded-full border font-medium transition-all
              ${active
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
              }
            `}
          >
            {s}
          </motion.button>
        );
      })}
    </div>
  );
}
