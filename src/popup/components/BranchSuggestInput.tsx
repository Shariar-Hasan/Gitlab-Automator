import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, GitBranch, Sparkles, Check } from 'lucide-react';

export interface SuggestionOption {
  value: string;
  label?: string;
  badge?: string;
  isPattern?: boolean;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  presets?: SuggestionOption[];
  projectBranches?: string[];
  disabled?: boolean;
  className?: string;
}

export function BranchSuggestInput({
  value,
  onChange,
  placeholder = 'Branch or pattern',
  icon,
  presets = [],
  projectBranches = [],
  disabled = false,
  className = '',
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Deduplicate and combine presets + project branches
  const combinedOptions: SuggestionOption[] = [
    ...presets,
    ...projectBranches
      .filter((branch) => !presets.some((p) => p.value.toLowerCase() === branch.toLowerCase()))
      .map((branch) => ({
        value: branch,
        label: branch,
        badge: 'Project',
      })),
  ];

  // Filter based on user typed value
  const filterQuery = (value || '').trim().toLowerCase();
  const filteredOptions = filterQuery
    ? combinedOptions.filter(
      (opt) =>
        opt.value.toLowerCase().includes(filterQuery) ||
        (opt.label && opt.label.toLowerCase().includes(filterQuery))
    )
    : combinedOptions;

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        {icon ? (
          <div className="absolute left-2 text-slate-400 pointer-events-none flex items-center">
            {icon}
          </div>
        ) : (
          <GitBranch className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-6 pr-6 py-1 text-[11px] font-mono border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 rounded-lg outline-hidden focus:ring-1 focus:ring-accent focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium transition-colors"
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="absolute right-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer transition-transform"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180 text-accent' : ''}`} />
        </button>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 max-w-[130%] w-max bg-white dark:bg-slate-850 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-100">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-center text-[10px] text-slate-400">
              No exact match. Custom pattern will be used: <br />
              <span className="font-mono text-accent font-semibold break-all">"{value}"</span>
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = value.toLowerCase() === opt.value.toLowerCase();
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-2.5 py-1.5 text-left flex items-center justify-between gap-1.5 hover:bg-accent/10 transition-colors cursor-pointer text-[9px] font-mono ${isSelected ? 'bg-accent/10 text-accent font-semibold' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  title={opt.label || opt.value}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {opt.isPattern ? (
                      <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                    ) : (
                      <GitBranch className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{opt.label || opt.value}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {opt.badge && (
                      <span className="text-[9px] px-1 py-0.2 rounded font-sans font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-3 h-3 text-accent" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
