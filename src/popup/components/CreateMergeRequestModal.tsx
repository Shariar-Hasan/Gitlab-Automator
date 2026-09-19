import React, { useState, useEffect, useRef } from 'react';
import { GitPullRequest, GitBranch, Search, X, Loader2, ExternalLink, ArrowRight, Check, FileText } from 'lucide-react';
import { BranchService } from '../../shared/services/branchService';
import { configStorage } from '../../shared/storage/configStorage';

interface Props {
  isOpen: boolean;
  projectKey: string;
  defaultTargetBranch: string;
  defaultDeleteSourceBranch?: boolean;
  onClose: () => void;
  onSubmitMR?: (projectKey: string) => Promise<void> | void;
}

export function CreateMergeRequestModal({
  isOpen,
  projectKey,
  defaultTargetBranch,
  defaultDeleteSourceBranch = false,
  onClose,
  onSubmitMR,
}: Props) {
  // Source branch state
  const [sourceBranch, setSourceBranch] = useState('');
  const [sourceSearchQuery, setSourceSearchQuery] = useState('');
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [sourceSelectedIndex, setSourceSelectedIndex] = useState<number>(-1);

  // Target branch state
  const [targetBranch, setTargetBranch] = useState(defaultTargetBranch || 'development');
  const [targetSearchQuery, setTargetSearchQuery] = useState(defaultTargetBranch || 'development');
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const [targetSelectedIndex, setTargetSelectedIndex] = useState<number>(-1);

  // Metadata state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deleteSourceBranch, setDeleteSourceBranch] = useState(defaultDeleteSourceBranch);

  // Branches list
  const [branches, setBranches] = useState<string[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const targetDropdownRef = useRef<HTMLDivElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialTarget = defaultTargetBranch || 'development';
      setTargetBranch(initialTarget);
      setTargetSearchQuery(initialTarget);
      setSourceBranch('');
      setSourceSearchQuery('');
      setTitle('');
      setDescription('');
      setDeleteSourceBranch(defaultDeleteSourceBranch);
      setIsSourceDropdownOpen(false);
      setIsTargetDropdownOpen(false);
      loadInitialBranches();
      setTimeout(() => sourceInputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultTargetBranch, defaultDeleteSourceBranch, projectKey]);

  const loadInitialBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const results = await BranchService.searchBranches(projectKey, '');
      setBranches(results);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  // Debounced search when query changes
  useEffect(() => {
    if (!isOpen) return;
    const queryToSearch = isSourceDropdownOpen ? sourceSearchQuery : isTargetDropdownOpen ? targetSearchQuery : '';
    if (!queryToSearch) return;

    const timer = setTimeout(async () => {
      setIsLoadingBranches(true);
      try {
        const results = await BranchService.searchBranches(projectKey, queryToSearch);
        setBranches(results);
      } finally {
        setIsLoadingBranches(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [sourceSearchQuery, targetSearchQuery, isSourceDropdownOpen, isTargetDropdownOpen, projectKey, isOpen]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(target)) {
        setIsSourceDropdownOpen(false);
      }
      if (targetDropdownRef.current && !targetDropdownRef.current.contains(target)) {
        setIsTargetDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSelectSourceBranch = (branchName: string) => {
    setSourceBranch(branchName);
    setSourceSearchQuery(branchName);
    setIsSourceDropdownOpen(false);
    if (!title) {
      const cleaned = branchName.replace(/[-_/]/g, ' ');
      setTitle(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
    }
  };

  const handleSelectTargetBranch = (branchName: string) => {
    setTargetBranch(branchName);
    setTargetSearchQuery(branchName);
    setIsTargetDropdownOpen(false);
  };

  const effectiveSource = sourceBranch.trim() || sourceSearchQuery.trim();
  const effectiveTarget = targetBranch.trim() || targetSearchQuery.trim() || defaultTargetBranch;

  // Filter branches locally for instant feedback
  const filteredSourceBranches = branches.filter((b) =>
    sourceSearchQuery ? b.toLowerCase().includes(sourceSearchQuery.toLowerCase()) : true
  );

  const filteredTargetBranches = branches.filter((b) =>
    targetSearchQuery ? b.toLowerCase().includes(targetSearchQuery.toLowerCase()) : true
  );

  const handleNavigateToGitLab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!effectiveSource) return;

    // 1. First save the timestamp
    try {
      if (onSubmitMR) {
        await onSubmitMR(projectKey);
      } else {
        await configStorage.recordMrCreated(projectKey);
      }
    } catch (err) {
      console.error('Failed to save MR timestamp:', err);
    }

    // 2. Then take to the merge request page
    const queryParams = new URLSearchParams();
    queryParams.set('merge_request[source_branch]', effectiveSource);
    queryParams.set('merge_request[target_branch]', effectiveTarget);
    queryParams.set('merge_request[force_remove_source_branch]', deleteSourceBranch ? 'true' : 'false');
    if (title.trim()) {
      queryParams.set('merge_request[title]', title.trim());
    }
    if (description.trim()) {
      queryParams.set('merge_request[description]', description.trim());
    }

    const mrUrl = `https://${projectKey}/-/merge_requests/new?${queryParams.toString()}`;

    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: mrUrl });
    } else {
      window.open(mrUrl, '_blank');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[96vh] text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between text-white shadow-xs"
          style={{
            background: 'linear-gradient(to right, var(--accent-color, #2563eb), var(--accent-hover, #1d4ed8))',
          }}
        >
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-4 h-4" />
            <h3 className="text-sm font-semibold tracking-wide">Create Merge Request</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleNavigateToGitLab} className="p-4 space-y-3.5 text-xs overflow-y-auto">
          {/* Visual Flow Banner */}
          <div className="p-2.5 bg-blue-50/70 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Repository</span>
              <span className="font-mono truncate max-w-[200px]">{projectKey}</span>
            </div>

            {/* Visual branch connection */}
            <div className="flex items-center justify-between gap-2 pt-1 font-mono text-[11px]">
              <div className="flex-1 truncate bg-white dark:bg-slate-900 p-1.5 rounded border border-blue-100 dark:border-slate-700">
                <span className="text-[9px] text-blue-600 dark:text-blue-400 block uppercase font-sans font-bold">Source</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">
                  {effectiveSource || <span className="italic text-slate-400">select branch...</span>}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="flex-1 truncate text-right bg-white dark:bg-slate-900 p-1.5 rounded border border-blue-100 dark:border-slate-700">
                <span className="text-[9px] text-blue-600 dark:text-blue-400 block uppercase font-sans font-bold">Target</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">
                  {effectiveTarget}
                </span>
              </div>
            </div>
          </div>

          {/* 1. Source Branch (Searchable Dropdown) */}
          <div className="space-y-1 relative" ref={sourceDropdownRef}>
            <label className="block font-medium text-slate-700 dark:text-slate-300 text-xs">
              Source Branch <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={sourceInputRef}
                type="text"
                value={sourceSearchQuery}
                onChange={(e) => {
                  setSourceSearchQuery(e.target.value);
                  setSourceBranch(e.target.value);
                  setIsSourceDropdownOpen(true);
                }}
                onFocus={() => setIsSourceDropdownOpen(true)}
                placeholder="Search or select source branch..."
                className="w-full pl-8 pr-8 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-mono text-slate-900 dark:text-slate-100"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {isLoadingBranches ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-500 absolute right-2.5 top-2.5 animate-spin" />
              ) : sourceSearchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSourceSearchQuery('');
                    setSourceBranch('');
                    sourceInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            {/* Source Dropdown Menu */}
            {isSourceDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-30 max-h-40 overflow-y-auto py-1">
                {isLoadingBranches && branches.length === 0 ? (
                  <div className="px-3 py-2 text-center text-slate-400 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching branches...</span>
                  </div>
                ) : filteredSourceBranches.length > 0 ? (
                  filteredSourceBranches.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleSelectSourceBranch(b)}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs font-mono transition-colors cursor-pointer ${
                        sourceBranch === b
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{b}</span>
                      </div>
                      {sourceBranch === b && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-slate-500 dark:text-slate-400 text-[11px] text-center">
                    <span>{sourceSearchQuery ? `Press enter to use "${sourceSearchQuery}"` : 'No branches found'}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Target Branch (Searchable Dropdown, Auto-selected) */}
          <div className="space-y-1 relative" ref={targetDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="block font-medium text-slate-700 dark:text-slate-300 text-xs">
                Target Branch <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-blue-600 dark:text-blue-400">Default auto-selected</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={targetSearchQuery}
                onChange={(e) => {
                  setTargetSearchQuery(e.target.value);
                  setTargetBranch(e.target.value);
                  setIsTargetDropdownOpen(true);
                }}
                onFocus={() => setIsTargetDropdownOpen(true)}
                placeholder="Search or select target branch..."
                className="w-full pl-8 pr-8 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs font-mono outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              />
              <GitBranch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {targetSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetSearchQuery('');
                    setTargetBranch('');
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Target Dropdown Menu */}
            {isTargetDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-30 max-h-40 overflow-y-auto py-1">
                {filteredTargetBranches.length > 0 ? (
                  filteredTargetBranches.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleSelectTargetBranch(b)}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs font-mono transition-colors cursor-pointer ${
                        targetBranch === b
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{b}</span>
                      </div>
                      {targetBranch === b && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-slate-500 dark:text-slate-400 text-[11px] text-center">
                    <span>{targetSearchQuery ? `Press enter to use "${targetSearchQuery}"` : 'No branches found'}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Title Input (Optional) */}
          <div className="space-y-1">
            <label className="block font-medium text-slate-700 dark:text-slate-300 text-xs">
              Title <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Resolve login session timeout issue"
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* 4. Description Textarea (Optional) */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 text-xs">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Description</span>
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of changes, issue links, etc."
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 resize-none font-sans"
            />
          </div>

          {/* 5. Delete Source Branch Checkbox */}
          <div className="pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={deleteSourceBranch}
                onChange={(e) => setDeleteSourceBranch(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-[11px] font-medium">Delete source branch when merge request is accepted</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2.5 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!effectiveSource || !effectiveTarget}
              className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Create Merge Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
