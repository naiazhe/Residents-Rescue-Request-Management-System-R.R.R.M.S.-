import { cn } from '../../lib/cn';

export function Input({ className, ...rest }) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm',
        'placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
        'disabled:bg-slate-50 disabled:text-slate-500',
        className,
      )}
      {...rest}
    />
  );
}

export function Select({ className, children, ...rest }) {
  return (
    <select
      className={cn(
        'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Label({ children, htmlFor, className }) {
  return (
    <label htmlFor={htmlFor} className={cn('block text-xs font-medium text-slate-700 mb-1', className)}>
      {children}
    </label>
  );
}
