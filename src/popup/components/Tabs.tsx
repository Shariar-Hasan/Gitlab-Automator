import React from 'react';
import { Home, Settings as SettingsIcon } from 'lucide-react';

export type TabId = 'home' | 'settings';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function Tabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={() => onTabChange('home')}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          activeTab === 'home'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('settings')}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          activeTab === 'settings'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <SettingsIcon className="w-3.5 h-3.5" />
        <span>Settings</span>
      </button>
    </div>
  );
}
