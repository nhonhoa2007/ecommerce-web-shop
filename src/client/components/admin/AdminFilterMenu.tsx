'use client';

export interface AdminFilterOption { value: string; label: string }

export function AdminFilterMenu({ label, value, options, onValueChange }: {
  label: string;
  value: string;
  options: readonly AdminFilterOption[];
  onValueChange: (value: string) => void;
}) {
  return <label className="inline-flex items-center gap-2 text-xs text-slate-600">
    <span className="sr-only">{label}</span>
    <select aria-label={label} value={value} onChange={(event) => onValueChange(event.target.value)} className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>;
}
