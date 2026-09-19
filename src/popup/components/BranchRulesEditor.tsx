import React, { useState, useEffect } from 'react';
import { BranchRule, DEFAULT_BRANCH_RULES } from '../../shared/types';
import { Plus, Trash2, RotateCcw, GitBranch, GitPullRequest, ArrowRight, HelpCircle, Info, Sparkles, X, AlertTriangle } from 'lucide-react';
import { BranchSuggestInput, SuggestionOption } from './BranchSuggestInput';
import { BranchService } from '../../shared/services/branchService';
import { logger } from '../../shared/utils/logger';
import { useConfirmation } from '../context/ConfirmationContext';

interface Props {
  rules: BranchRule[];
  onChange: (rules: BranchRule[]) => void;
  onResetToDefaults?: () => void;
  defaultBranch?: string;
  projectKey?: string;
  availableBranches?: string[];
}

const SOURCE_PRESETS = [
  { label: 'Any (*)', value: '*' },
  { label: 'feat/*', value: 'feat/*' },
  { label: 'development', value: 'development' },
  { label: 'hotfix/*', value: 'hotfix/*' },
];

const SOURCE_SUGGESTIONS: SuggestionOption[] = [
  { value: '*', label: 'Any branch (*)', badge: 'Catch-all', isPattern: true },
  { value: 'feat/*', label: 'feat/* (Feature)', badge: 'Pattern', isPattern: true },
  { value: 'hotfix/*', label: 'hotfix/* (Hotfix)', badge: 'Pattern', isPattern: true },
  { value: 'fix/*', label: 'fix/* (Bugfix)', badge: 'Pattern', isPattern: true },
  { value: 'development', label: 'development', badge: 'Branch' },
  { value: 'main', label: 'main', badge: 'Branch' },
];

const TARGET_SUGGESTIONS: SuggestionOption[] = [
  { value: 'development', label: 'development', badge: 'Default' },
  { value: 'main', label: 'main', badge: 'Main' },
  { value: 'master', label: 'master', badge: 'Branch' },
  { value: 'staging', label: 'staging', badge: 'Branch' },
  { value: 'production', label: 'production', badge: 'Branch' },
];

export function BranchRulesEditor({
  rules = [],
  onChange,
  onResetToDefaults,
  defaultBranch = 'development',
  projectKey,
  availableBranches,
}: Props) {
  const [showHelp, setShowHelp] = useState(true);
  const [fetchedBranches, setFetchedBranches] = useState<string[]>([]);
  const { confirm } = useConfirmation();

  useEffect(() => {
    if (availableBranches && availableBranches.length > 0) {
      setFetchedBranches(availableBranches);
      return;
    }
    if (!projectKey) return;

    let isMounted = true;
    BranchService.searchBranches(projectKey, '')
      .then((branches) => {
        if (isMounted && Array.isArray(branches)) {
          setFetchedBranches(branches);
        }
      })
      .catch((err) => {
        logger.warn('Could not load project branches for suggest', err);
      });

    return () => {
      isMounted = false;
    };
  }, [projectKey, availableBranches]);

  const handleRuleChange = (index: number, updates: Partial<BranchRule>) => {
    const next = rules.map((r, i) => (i === index ? { ...r, ...updates } : r));
    onChange(next);
  };

  const handleAddRule = (presetSource?: string, presetTarget?: string) => {
    const newRule: BranchRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sourcePattern: presetSource || 'feat/*',
      targetBranch: presetTarget || defaultBranch,
      deleteSourceBranch: undefined,
    };
    onChange([...rules, newRule]);
  };

  const handleDeleteRule = (index: number) => {
    const next = rules.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleResetClick = async () => {
    const ok = await confirm({
      title: 'Reset Rules to Recommended Defaults?',
      description: `This will replace all your current ${rules.length} custom routing rule${rules.length === 1 ? '' : 's'} with the standard workflow defaults.`,
      confirmText: 'Yes, Reset Rules',
      variant: 'warning',
      children: (
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-2.5 border border-slate-200/70 dark:border-slate-700/80 space-y-2 text-[11px] font-mono">
          <div className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Defaults to be applied:
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-700 dark:text-slate-200 font-medium">1. development</span>
            <span className="text-slate-400">➔</span>
            <span className="text-accent font-bold">main</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-700/50 pt-1.5">
            <span className="text-slate-700 dark:text-slate-200 font-medium">* (Any branch)</span>
            <span className="text-slate-400">➔</span>
            <span className="text-accent font-bold">development</span>
          </div>
        </div>
      ),
      note: (
        <span><strong className="text-amber-700 dark:text-amber-400 font-semibold">Note:</strong> Any custom branch patterns, targets, or delete branch settings in this list will be replaced.</span>
      ),
    });

    if (ok) {
      if (onResetToDefaults) {
        onResetToDefaults();
      } else {
        onChange(DEFAULT_BRANCH_RULES);
      }
    }
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-accent-light flex items-center justify-center text-accent shrink-0">
            <GitBranch className="w-3 h-3" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
            Automated Branch Rules
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
            {rules.length}
          </span>
          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            className={`cursor-pointer p-0.5 transition-colors ${
              showHelp
                ? 'text-accent'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title={showHelp ? 'Hide guidance' : 'How routing rules work'}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleResetClick}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset to recommended defaults (dev -> main, * -> dev)"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddRule()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent hover:bg-accent-hover text-white text-[11px] font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Rule</span>
          </button>
        </div>
      </div>

      {/* Helper Box */}
      {showHelp && (
        <div className="p-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
              <Info className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>How Branch Automation Works</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="p-0.5 rounded-md text-blue-400 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-100/60 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              title="Close guidance"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-blue-800/85 dark:text-blue-300/85 leading-relaxed">
            When you open the GitLab <code className="font-mono px-1 py-0.2 rounded bg-blue-100/70 dark:bg-blue-900/60 font-bold">/-/merge_requests/new</code> page, the extension matches your current source branch against these rules from top to bottom:
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[10px] font-mono">
            <div className="bg-white/80 dark:bg-slate-900/60 p-1.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
              <span className="text-blue-600 dark:text-blue-400 block font-sans font-bold text-[9px] uppercase">Default 1</span>
              <span>development</span> → <span className="text-accent font-bold">main</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-1.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
              <span className="text-blue-600 dark:text-blue-400 block font-sans font-bold text-[9px] uppercase">Default 2</span>
              <span>* (Any branch)</span> → <span className="text-accent font-bold">development</span>
            </div>
          </div>
        </div>
      )}

      {/* Rules List Container */}
      <div className="space-y-2.5 pr-0.5">
        {rules.length === 0 ? (
          <div className="p-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 space-y-1.5">
            <p className="text-xs">No automation rules configured.</p>
            <button
              type="button"
              onClick={handleResetClick}
              className="inline-flex items-center gap-1 text-[11px] text-accent font-medium hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore recommended defaults</span>
            </button>
          </div>
        ) : (
          rules.map((rule, index) => {
            const isDefaultDev = rule.sourcePattern.toLowerCase() === 'development';
            const isCatchAll = rule.sourcePattern === '*' || rule.sourcePattern.toLowerCase() === 'any';

            return (
              <div
                key={rule.id || index}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3 space-y-2.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Card Top: Rule Badge & Delete */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                      #{index + 1}
                    </span>
                    {isDefaultDev ? (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                        Release to Main
                      </span>
                    ) : isCatchAll ? (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        Catch-all (Any Branch)
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Custom Rule
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteRule(index)}
                    title="Delete this rule"
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Center: Suggest Input Flow */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
                  {/* Source Branch Input with Suggestions */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
                      When Source Is
                    </span>
                    <BranchSuggestInput
                      value={rule.sourcePattern}
                      onChange={(val) => handleRuleChange(index, { sourcePattern: val })}
                      placeholder="* or feat/*"
                      presets={SOURCE_SUGGESTIONS}
                      projectBranches={fetchedBranches}
                      icon={<GitBranch className="w-3 h-3 text-slate-400" />}
                    />
                  </div>

                  {/* Flow Arrow */}
                  <div className="pt-6 flex justify-center text-slate-400 shrink-0">
                    <ArrowRight className="w-4 h-4 text-accent" />
                  </div>

                  {/* Target Branch Input with Suggestions */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
                      Auto-Target Branch
                    </span>
                    <BranchSuggestInput
                      value={rule.targetBranch}
                      onChange={(val) => handleRuleChange(index, { targetBranch: val })}
                      placeholder="e.g. development"
                      presets={TARGET_SUGGESTIONS}
                      projectBranches={fetchedBranches}
                      icon={<GitPullRequest className="w-3 h-3 text-accent" />}
                    />
                  </div>
                </div>

                {/* Quick Presets Pills */}
                <div className="flex items-center justify-between gap-1 pt-0.5 text-[9px] text-slate-400">
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    <span className="text-slate-400 shrink-0">Presets:</span>
                    {SOURCE_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => handleRuleChange(index, { sourcePattern: p.value })}
                        className={`px-1.5 py-0.5 rounded font-mono text-[9px] transition-colors cursor-pointer ${
                          rule.sourcePattern === p.value
                            ? 'bg-accent/15 text-accent font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Delete Source Branch Segmented Control */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">
                    Delete source branch:
                  </span>
                  <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleRuleChange(index, { deleteSourceBranch: undefined })}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                        rule.deleteSourceBranch === undefined
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Default
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRuleChange(index, { deleteSourceBranch: true })}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                        rule.deleteSourceBranch === true
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Always
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRuleChange(index, { deleteSourceBranch: false })}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                        rule.deleteSourceBranch === false
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Never
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
