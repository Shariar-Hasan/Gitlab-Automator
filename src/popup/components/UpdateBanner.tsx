import React from 'react';
import { Sparkles, ExternalLink, X } from 'lucide-react';
import { UpdateCheckResult } from '../../shared/services/updateService';

interface Props {
  updateInfo: UpdateCheckResult;
  onDismiss: () => void;
}

export function UpdateBanner({ updateInfo, onDismiss }: Props) {
  const handleOpenRelease = () => {
    const url = updateInfo.releaseUrl || 'https://github.com/Shariar-Hasan/Gitlab-Automator/releases';
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-3 py-2 shadow-md border-b border-indigo-400/30 flex items-center justify-between gap-2 animate-in slide-in-from-top-2 duration-200 z-50">
      {/* Clickable Area */}
      <button
        type="button"
        onClick={handleOpenRelease}
        className="flex-1 flex items-center gap-2 text-left cursor-pointer hover:opacity-95 transition-opacity min-w-0"
        title="Click to view new release on GitHub"
      >
        <span className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold tracking-tight">New Update Available!</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/25 text-white font-semibold">
              v{updateInfo.latestVersion}
            </span>
          </div>
          <p className="text-[10px] text-blue-100/90 truncate flex items-center gap-1">
            <span>Click to download or view releases</span>
            <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
          </p>
        </div>
      </button>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        title="Dismiss alert"
        className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
