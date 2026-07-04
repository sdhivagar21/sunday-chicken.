export default function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-2', lg: 'w-10 h-10 border-3' };
  const colors = { primary: 'border-primary border-t-transparent', white: 'border-white border-t-transparent', gray: 'border-gray-400 border-t-transparent' };
  return (
    <div className={`rounded-full animate-spin ${sizes[size]} ${colors[color]} ${className}`} />
  );
}
