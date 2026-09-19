import React, { useState, useEffect } from 'react';
import { ProjectConfig, BranchRule, DEFAULT_BRANCH_RULES } from '../../shared/types';
import { X, Sliders, Palette, GitBranch, Trash2, Check } from 'lucide-react';
import { BranchRulesEditor } from './BranchRulesEditor';
import { BranchSuggestInput } from './BranchSuggestInput';
import { BranchService } from '../../shared/services/branchService';

interface Props {
  isOpen: boolean;
  project: ProjectConfig | null;
  globalDefaultBranch: string;
  onSave: (projectKey: string, updates: Partial<ProjectConfig>) => void;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500', ring: 'ring-blue-500', text: 'text-blue-600', light: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500', ring: 'ring-purple-500', text: 'text-purple-600', light: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', ring: 'ring-amber-500', text: 'text-amber-600', light: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500', ring: 'ring-rose-500', text: 'text-rose-600', light: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'slate', label: 'Slate', bg: 'bg-slate-500', ring: 'ring-slate-500', text: 'text-slate-600', light: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export { COLOR_OPTIONS };

export function ProjectSettingsDialog({
  isOpen,
  project,
  globalDefaultBranch,
  onSave,
  onClose,
}: Props) {
  const [customName, setCustomName] = useState('');
  const [colorTag, setColorTag] = useState('blue');
  const [targetBranch, setTargetBranch] = useState('');
  const [deleteSourceBranch, setDeleteSourceBranch] = useState<'inherit' | 'true' | 'false'>('inherit');
  const [useCustomRules, setUseCustomRules] = useState(false);
  const [branchRules, setBranchRules] = useState<BranchRule[]>(DEFAULT_BRANCH_RULES);
  const [projectBranches, setProjectBranches] = useState<string[]>([]);

  useEffect(() => {
    if (project) {
      setCustomName(project.customName || '');
      setColorTag(project.colorTag || 'blue');
      setTargetBranch(project.targetBranch || globalDefaultBranch);
      if (project.deleteSourceBranch === undefined) {
        setDeleteSourceBranch('inherit');
      } else {
        setDeleteSourceBranch(project.deleteSourceBranch ? 'true' : 'false');
      }
      setUseCustomRules(!!project.useCustomBranchRules);
      setBranchRules(
        project.branchRules && project.branchRules.length > 0
          ? project.branchRules
          : DEFAULT_BRANCH_RULES
      );

      // Load repository branches for suggestions
      BranchService.searchBranches(project.projectKey, '').then((branches) => {
        if (Array.isArray(branches)) {
          setProjectBranches(branches);
        }
      });
    }
  }, [project, globalDefaultBranch]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(project.projectKey, {
      customName: customName.trim() || undefined,
      colorTag,
      targetBranch: targetBranch.trim() || globalDefaultBranch,
      deleteSourceBranch:
        deleteSourceBranch === 'inherit'
          ? undefined
          : deleteSourceBranch === 'true',
      useCustomBranchRules: useCustomRules,
      branchRules: useCustomRules ? branchRules : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[96%] text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold tracking-wide">Project Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Body */}
          <div className="p-3.5 space-y-3.5 text-xs overflow-y-auto flex-1 min-h-0">
            {/* Project Key Indicator */}
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-700 font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate">
              {project.projectKey}
            </div>

            {/* Custom Name */}
            <div className="space-y-1">
              <label className="block font-medium text-slate-700 dark:text-slate-300">
                Custom Project Name / Alias
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Core API Service"
                className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Color Tag Picker */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                <span>Project Color Badge</span>
              </label>
              <div className="flex items-center gap-2 pt-0.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorTag(c.id)}
                    title={c.label}
                    className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center transition-transform cursor-pointer ${colorTag === c.id ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-offset-slate-900 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                  >
                    {colorTag === c.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}

                {/* Custom HTML5 Color Picker */}
                <label
                  title="Custom Color Picker"
                  className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer border border-slate-300 dark:border-slate-600 ${colorTag.startsWith('#') ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-offset-slate-900 scale-110' : 'hover:scale-105'
                    }`}
                  style={
                    colorTag.startsWith('#')
                      ? { backgroundColor: colorTag }
                      : { background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }
                  }
                >
                  <input
                    type="color"
                    value={colorTag.startsWith('#') ? colorTag : '#3b82f6'}
                    onChange={(e) => setColorTag(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  {colorTag.startsWith('#') && <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-xs" />}
                </label>
              </div>
            </div>

            {/* Target Branch */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                <span>Default Target Branch</span>
              </label>
              <BranchSuggestInput
                value={targetBranch}
                onChange={setTargetBranch}
                placeholder={`Default (${globalDefaultBranch})`}
                presets={[
                  { value: 'development', label: 'development', badge: 'Default' },
                  { value: 'main', label: 'main', badge: 'Main' },
                  { value: 'master', label: 'master', badge: 'Branch' },
                  { value: 'staging', label: 'staging', badge: 'Branch' },
                ]}
                projectBranches={projectBranches}
                icon={<GitBranch className="w-3 h-3 text-slate-400" />}
              />
            </div>

            {/* Delete Source Branch option */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Delete Source Branch on Merge</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setDeleteSourceBranch('inherit')}
                  className={`py-1 text-[11px] rounded font-medium transition-colors cursor-pointer ${deleteSourceBranch === 'inherit'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  Global
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteSourceBranch('true')}
                  className={`py-1 text-[11px] rounded font-medium transition-colors cursor-pointer ${deleteSourceBranch === 'true'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  Always
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteSourceBranch('false')}
                  className={`py-1 text-[11px] rounded font-medium transition-colors cursor-pointer ${deleteSourceBranch === 'false'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  Never
                </button>
              </div>
            </div>

            {/* Custom Branch Routing Toggle & Editor */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Custom Branch Routing
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                    Override global routing rules for this project
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={useCustomRules}
                    onChange={(e) => setUseCustomRules(e.target.checked)}
                  />
                  <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {useCustomRules && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <BranchRulesEditor
                    rules={branchRules}
                    onChange={setBranchRules}
                    onResetToDefaults={() => setBranchRules(DEFAULT_BRANCH_RULES)}
                    defaultBranch={targetBranch.trim() || globalDefaultBranch}
                    projectKey={project.projectKey}
                    availableBranches={projectBranches}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pinned Sticky Footer */}
          <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs cursor-pointer transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
