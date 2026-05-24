# adminApp — Reusable UI Components Library

## Overview
Lightweight Tailwind-styled primitives shared by every page. No external UI framework (no shadcn/MUI/AntD) — everything is plain JSX + Tailwind classes with `tailwind-merge` (`cn`) for class composition.

## Files (`src/components/ui/`)
1. **`Button.jsx`** — variants: `primary` (default, brand-600), `outline`, `secondary`, `ghost`, `danger`. Sizes: `sm`, `md`. Accepts icons (typically `lucide-react`).
2. **`Input.jsx`** — exports `Input`, `Select`, `Label`. Bordered, focus ring `ring-brand-500/30`.
3. **`Card.jsx`** — exports `Card`, `CardHeader`, `CardBody`. White surface with `shadow-card` and `border-slate-100`.
4. **`Modal.jsx`** — fixed overlay with `bg-slate-900/40` backdrop. Closes on backdrop click + Escape key (uses a `useEffect` keydown listener). Accepts `title`, `children`, `footer`, `size` ∈ `sm|md|lg|xl`.
5. **`Table.jsx`** — exports `Table`, `THead`, `TBody`, `TR`, `TH`, `TD`, `EmptyRow`. Styled with `border-slate-200`, `bg-slate-50` header, hover row tint.
6. **`Badge.jsx`** — small pill with tone prop: `blue | green | amber | red | violet | slate`. Uses a tone→class map.

## Helpers
- **`src/lib/cn.js`**:
  ```js
  import { twMerge } from 'tailwind-merge';
  import clsx from 'clsx';
  export const cn = (...args) => twMerge(clsx(...args));
  ```

## Style conventions
- Tailwind `brand-*` palette comes from `tailwind.config.js` (blue family).
- Tables: dense rows, `text-sm`, `text-slate-600` body.
- Cards: rounded-xl, soft shadow.
- Inputs/Buttons share `h-9` for visual alignment.

## Acceptance criteria
- All pages import from `src/components/ui/...` — no inline `<button className="bg-blue-...">` markup leaking into pages.
- Modal traps Escape and dims the background; clicking outside closes.
- `<EmptyRow colSpan={N} />` renders a centered "No results" message spanning the whole row.
- The `<Badge>` tone prop must be type-safe (literal union); unknown tones fall back to slate.
