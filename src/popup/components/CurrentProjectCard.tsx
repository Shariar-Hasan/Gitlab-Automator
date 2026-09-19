import React, { useState, useEffect } from 'react';
import { ProjectConfig, GlobalConfig } from '../../shared/types';
import { FolderGit2, ChevronDown, ShieldBan, CheckCircle2 } from 'lucide-react';
import { COLOR_OPTIONS } from './ProjectSettingsDialog';
import { useConfirmation } from '../context/ConfirmationContext';

interface Props {
  url: string;
  projects: Record<string, ProjectConfig>;
  globalConfig: GlobalConfig;
  onAdd: (project: ProjectConfig) => void;
  disabled: boolean;
  onAddToException: (projectKey: string) => void;
}

export function CurrentProjectCard({
  url,
  projects,
  globalConfig,
  onAdd,
  disabled,
  onAddToException,
}: Props) {
  const { confirm } = useConfirmation();
  const [isExpanded, setIsExpanded] = useState(false);

  let projectKey = '';
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && !['dashboard', 'explore', 'help'].includes(pathParts[0])) {
      const dashIndex = pathParts.indexOf('-');
      const projectParts = dashIndex > -1 ? pathParts.slice(0, dashIndex) : pathParts.slice(0, 2);
      projectKey = `${urlObj.host}/${projectParts.join('/')}`;
    }
  } catch (e) {
    // Invalid URL
  }

  // Auto-add to projects list immediately when on a GitLab page, if not blacklisted
  useEffect(() => {
    if (projectKey && !projects[projectKey]) {
      const isBlacklisted = globalConfig.autoSyncBlacklist?.includes(projectKey);
      if (!isBlacklisted && globalConfig.autoSyncVisitedProjects !== false) {
        onAdd({
          projectKey,
          targetBranch: globalConfig.defaultTargetBranch,
          enabled: true,
          lastVisited: Date.now(),
        });
      }
    }
  }, [projectKey, projects, globalConfig, onAdd]);

  if (!projectKey) return null;

  const projectConfig = projects[projectKey];
  const isBlacklisted = globalConfig.autoSyncBlacklist?.includes(projectKey);
  const colorMeta = projectConfig?.colorTag
    ? COLOR_OPTIONS.find((c) => c.id === projectConfig.colorTag)
    : null;

  const handleExceptionClick = async () => {
    const ok = await confirm({
      title: 'Add Project to Exception List?',
      description: `Do you want to add "${projectKey}" to the exception list?`,
      confirmText: 'Add to Exceptions',
      variant: 'warning',
      note: 'If added, this project will never be automatically added or synced by the extension. You will have to manage it manually.',
    });
    if (ok) {
      onAddToException(projectKey);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full p-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <div className="w-7 h-7 rounded-lg bg-accent-light flex items-center justify-center text-accent shrink-0">
            <FolderGit2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {projectConfig?.customName || projectKey.split('/').slice(1).join('/') || projectKey}
              </span>
              {colorMeta && <span className={`w-2 h-2 rounded-full ${colorMeta.bg} shrink-0`} />}
            </div>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
              Active Page
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isBlacklisted ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
              Excluded
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Synced
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-2.5 animate-in fade-in duration-150">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
              Repository URL
            </span>
            <p className="font-mono text-slate-800 dark:text-slate-200 text-xs truncate">
              {projectKey}
            </p>
          </div>

          <div className="flex justify-between items-center text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Target Branch:</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              {projectConfig?.targetBranch || globalConfig.defaultTargetBranch}
            </span>
          </div>

          {/* Action: Add to Exception */}
          <div className="pt-1 flex justify-end">
            {!isBlacklisted ? (
              <button
                type="button"
                onClick={handleExceptionClick}
                className="flex items-center gap-1.5 text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer"
              >
                <ShieldBan className="w-3.5 h-3.5" />
                <span>Add to Exception</span>
              </button>
            ) : (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                Project is in the exception list (auto-sync disabled).
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
