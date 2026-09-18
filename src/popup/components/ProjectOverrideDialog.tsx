import React, { useState } from 'react';
import { ProjectConfig } from '../../shared/types';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (project: ProjectConfig) => void;
  existingKeys: string[];
}

export function ProjectOverrideDialog({ onClose, onSave, existingKeys }: Props) {
  const [projectKey, setProjectKey] = useState('');
  const [customName, setCustomName] = useState('');
  const [targetBranch, setTargetBranch] = useState('development');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = projectKey.trim().toLowerCase();

    if (!key) {
      setError('Project URL/Path is required');
      return;
    }

    if (existingKeys.includes(key)) {
      setError('This project is already configured');
      return;
    }

    if (!targetBranch.trim()) {
      setError('Target branch is required');
      return;
    }

    // Clean up full URLs if user pasted one
    let finalKey = key;
    try {
      if (key.startsWith('http')) {
        const url = new URL(key);
        const parts = url.pathname.split('/').filter(Boolean);
        const dashIndex = parts.indexOf('-');
        const projectParts = dashIndex > -1 ? parts.slice(0, dashIndex) : parts;
        finalKey = `${url.host}/${projectParts.join('/')}`;
      }
    } catch (e) {
      // Ignore if not a valid URL
    }

    onSave({
      projectKey: finalKey,
      customName: customName.trim() || undefined,
      targetBranch: targetBranch.trim(),
      enabled: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold">Add Project Override</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Project URL or Path <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectKey}
              onChange={(e) => {
                setProjectKey(e.target.value);
                setError('');
              }}
              placeholder="e.g. gitlab.com/group/project"
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Paste the full GitLab URL or group/project path
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Project Name / Alias <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Core API Service"
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Branch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={targetBranch}
              onChange={(e) => {
                setTargetBranch(e.target.value);
                setError('');
              }}
              placeholder="e.g. development"
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs font-mono outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
