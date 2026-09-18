import React from 'react';
import iconLogo from '../../logo/icon.png';

interface HeaderProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function Header({ enabled, onToggle }: HeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs overflow-hidden border border-slate-200/80 dark:border-slate-700 bg-white">
          <img src={iconLogo} alt="GitLab Automator" className="w-full h-full object-contain p-0.5 rounded-md" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">GitLab Automator</h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage MR Targets</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {enabled ? 'ON' : 'OFF'}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
        </label>
      </div>
    </div>
  );
}
