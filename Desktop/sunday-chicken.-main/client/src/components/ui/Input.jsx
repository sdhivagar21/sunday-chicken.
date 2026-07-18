import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  type = 'text',
  className = '',
  required = false,
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-accent mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
    )}
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          w-full border rounded-xl px-4 py-3 text-sm text-accent bg-white
          placeholder:text-gray-400 outline-none
          transition-all duration-200
          ${icon ? 'pl-10' : ''}
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-red-100'
          }
          ${className}
        `}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
