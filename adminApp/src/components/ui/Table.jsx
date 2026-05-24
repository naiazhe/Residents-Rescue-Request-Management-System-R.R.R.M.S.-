import { cn } from '../../lib/cn';

export function Table({ className, children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className={cn('min-w-full divide-y divide-slate-200 text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return <thead className="bg-slate-50">{children}</thead>;
}

export function TR({ className, children, ...rest }) {
  return <tr className={cn('hover:bg-slate-50/50', className)} {...rest}>{children}</tr>;
}

export function TH({ className, children }) {
  return (
    <th className={cn(
      'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600',
      className,
    )}>
      {children}
    </th>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>;
}

export function TD({ className, children, ...rest }) {
  return (
    <td className={cn('px-4 py-2.5 text-slate-700 whitespace-nowrap', className)} {...rest}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, children = 'No records' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-slate-500">
        {children}
      </td>
    </tr>
  );
}
