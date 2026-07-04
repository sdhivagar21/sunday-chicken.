import { forwardRef } from 'react';

const Textarea = forwardRef(({ label, error, hint, required = false, className = '', rows = 3, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-accent mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      rows={rows}
      className={`
        w-full border rounded-xl px-4 py-3 text-sm text-accent bg-white
        placeholder:text-gray-400 outline-none resize-none
        transition-all duration-200
        ${error
          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
          : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-red-100'
        }
        ${className}
      `}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">⚠ {error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
));
Textarea.displayName = 'Textarea';
export default Textarea;
