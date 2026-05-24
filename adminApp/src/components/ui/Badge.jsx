import { cn } from '../../lib/cn';

const tones = {
  slate:  'bg-slate-100 text-slate-700',
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  amber:  'bg-amber-100 text-amber-800',
  blue:   'bg-blue-100 text-blue-800',
  violet: 'bg-violet-100 text-violet-800',
};

export function Badge({ tone = 'slate', className, children }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      tones[tone] || tones.slate,
      className,
    )}>
      {children}
    </span>
  );
}
