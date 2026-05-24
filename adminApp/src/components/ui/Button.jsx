import { cn } from '../../lib/cn';

const variants = {
  primary:   'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  danger:    'bg-red-600 text-white hover:bg-red-700',
  ghost:     'bg-transparent text-slate-700 hover:bg-slate-100',
  outline:   'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
};

const sizes = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

export function Button({
  variant = 'primary', size = 'md', className, disabled, children, ...rest
}) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
