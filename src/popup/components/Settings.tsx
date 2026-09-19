import React, { useRef, useState, useEffect } from 'react';
import { ExtensionConfig, GlobalConfig, GitLabAuthData, DEFAULT_BRANCH_RULES } from '../../shared/types';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Key,
  CheckCircle2,
  Sun,
  Moon,
  GitBranch,
  Trash2,
  Link,
  Plus,
  X,
  Sliders,
  ShieldBan,
  Palette,
  Square,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { authStorage } from '../../shared/storage/authStorage';
import { THEME_ACCENT_PRESETS } from '../../shared/utils/theme';
import { UpdateService, UpdateCheckResult } from '../../shared/services/updateService';
import { useConfirmation } from '../context/ConfirmationContext';
import { BranchRulesEditor } from './BranchRulesEditor';

interface Props {
  config: ExtensionConfig;
  onImport: (config: ExtensionConfig) => void;
  onReset: () => void;
  onUpdateGlobal: (updates: Partial<GlobalConfig>) => void;
  updateInfo?: UpdateCheckResult | null;
  onUpdateFound?: (result: UpdateCheckResult) => void;
}

export function Settings({ config, onImport, onReset, onUpdateGlobal, updateInfo, onUpdateFound }: Props) {
  const { confirm } = useConfirmation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authData, setAuthData] = useState<GitLabAuthData | null>(null);
  const [patToken, setPatToken] = useState(config.global.personalAccessToken || '');
  const [targetBranchInput, setTargetBranchInput] = useState(config.global.defaultTargetBranch || 'development');
  const [isSavedToken, setIsSavedToken] = useState(false);
  const [isSavedBranch, setIsSavedBranch] = useState(false);
  const [newBlacklistEntry, setNewBlacklistEntry] = useState('');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatusMessage, setUpdateStatusMessage] = useState<string | null>(null);
  const [manualCheckResult, setManualCheckResult] = useState<UpdateCheckResult | null>(updateInfo || null);

  const handleManualCheck = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatusMessage(null);
    try {
      const res = await UpdateService.checkForUpdates(true);
      setManualCheckResult(res);
      if (res.hasUpdate) {
        setUpdateStatusMessage(`New version v${res.latestVersion} is available!`);
        onUpdateFound?.(res);
      } else {
        setUpdateStatusMessage(`You're on the latest version (v${res.currentVersion}).`);
      }
    } catch (err) {
      setUpdateStatusMessage('Failed to check for updates. Please check your connection.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  useEffect(() => {
    authStorage.getAuthData().then(setAuthData);
  }, []);

  useEffect(() => {
    setPatToken(config.global.personalAccessToken || '');
    setTargetBranchInput(config.global.defaultTargetBranch || 'development');
  }, [config.global]);

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'gitlab-automator-config.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          onImport(parsed);
        } catch (error) {
          alert('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetConfirm = async () => {
    const ok = await confirm({
      title: 'Reset All Extension Settings?',
      description: 'This will reset your global configuration and permanently remove all custom project overrides.',
      confirmText: 'Yes, Reset Everything',
      variant: 'danger',
      note: 'This action cannot be undone. All custom branch automation rules, tokens, and theme settings will be reverted to factory defaults.',
    });
    if (ok) {
      onReset();
    }
  };

  const handleSavePat = () => {
    onUpdateGlobal({ personalAccessToken: patToken.trim() || undefined });
    setIsSavedToken(true);
    setTimeout(() => setIsSavedToken(false), 2000);
  };

  const handleSaveDefaultBranch = () => {
    onUpdateGlobal({ defaultTargetBranch: targetBranchInput.trim() || 'development' });
    setIsSavedBranch(true);
    setTimeout(() => setIsSavedBranch(false), 2000);
  };

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = newBlacklistEntry.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!entry) return;

    const currentList = config.global.autoSyncBlacklist || [];
    if (!currentList.includes(entry)) {
      onUpdateGlobal({ autoSyncBlacklist: [...currentList, entry] });
    }
    setNewBlacklistEntry('');
  };

  const handleRemoveBlacklist = (entry: string) => {
    const currentList = config.global.autoSyncBlacklist || [];
    onUpdateGlobal({ autoSyncBlacklist: currentList.filter((e) => e !== entry) });
  };

  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const currentRadius = config.global.borderRadius || 'md';

  return (
    <div className="space-y-3.5 text-xs text-slate-800 dark:text-slate-200 pb-2">
      {/* ────────────────────────────────────────────────
          Category 1: Appearance & UI Style
         ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold text-xs tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Appearance & Theme</span>
        </div>

        {/* Theme Mode */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            {config.global.theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>Theme Mode</span>
          </span>
          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onUpdateGlobal({ theme: 'light' })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                config.global.theme !== 'dark'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateGlobal({ theme: 'dark' })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                config.global.theme === 'dark'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="w-3 h-3 text-indigo-400" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* UI Accent Color */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>Accent Color</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {config.global.accentColor || '#2563eb'}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            {THEME_ACCENT_PRESETS.map((preset) => {
              const isActive = (config.global.accentColor || '#2563eb').toLowerCase() === preset.color.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onUpdateGlobal({ accentColor: preset.color })}
                  title={preset.name}
                  className={`color-swatch w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer shadow-xs ${
                    isActive ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-offset-slate-900 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: preset.color }}
                >
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}

            {/* Custom Color Picker */}
            <label
              title="Custom Hex Color"
              className={`color-swatch relative w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer border border-slate-300 dark:border-slate-600 shadow-xs ${
                !THEME_ACCENT_PRESETS.some((p) => p.color.toLowerCase() === (config.global.accentColor || '').toLowerCase())
                  ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-offset-slate-900 scale-110'
                  : 'hover:scale-105'
              }`}
              style={
                !THEME_ACCENT_PRESETS.some((p) => p.color.toLowerCase() === (config.global.accentColor || '').toLowerCase())
                  ? { backgroundColor: config.global.accentColor || '#2563eb' }
                  : { background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }
              }
            >
              <input
                type="color"
                value={config.global.accentColor || '#2563eb'}
                onChange={(e) => onUpdateGlobal({ accentColor: e.target.value })}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              {!THEME_ACCENT_PRESETS.some((p) => p.color.toLowerCase() === (config.global.accentColor || '').toLowerCase()) && (
                <CheckCircle2 className="w-3.5 h-3.5 text-white drop-shadow-xs" />
              )}
            </label>
          </div>
        </div>

        {/* Corner Rounding Style */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span>Corner Roundness</span>
            </span>
            <span className="text-[10px] text-slate-400 capitalize">
              {currentRadius === 'none' ? 'Sharp (0px)' : currentRadius === 'sm' ? 'Soft (4px)' : 'Rounded (12px)'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onUpdateGlobal({ borderRadius: 'none' })}
              className={`py-1 text-[11px] font-medium transition-all cursor-pointer ${
                currentRadius === 'none'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sharp
            </button>
            <button
              type="button"
              onClick={() => onUpdateGlobal({ borderRadius: 'sm' })}
              className={`py-1 text-[11px] font-medium transition-all cursor-pointer ${
                currentRadius === 'sm'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Soft
            </button>
            <button
              type="button"
              onClick={() => onUpdateGlobal({ borderRadius: 'md' })}
              className={`py-1 text-[11px] font-medium transition-all cursor-pointer ${
                currentRadius === 'md'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Rounded
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────
          Category 2: Branch Automation Rules
         ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3.5">
        <BranchRulesEditor
          rules={config.global.branchRules || DEFAULT_BRANCH_RULES}
          onChange={(branchRules) => onUpdateGlobal({ branchRules })}
          onResetToDefaults={() => onUpdateGlobal({ branchRules: DEFAULT_BRANCH_RULES })}
          defaultBranch={config.global.defaultTargetBranch || 'development'}
        />

        {/* Global Fallback & Options */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Delete Source Branch by Default</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Fallback if rule doesn't specify
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={config.global.defaultDeleteSourceBranch}
                onChange={(e) => onUpdateGlobal({ defaultDeleteSourceBranch: e.target.checked })}
              />
              <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────
          Category 3: Auto-Sync & Project Exceptions
         ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-xs tracking-wide flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Link className="w-3.5 h-3.5 text-accent" />
              <span>Auto-Sync Projects</span>
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Automatically track GitLab projects when visited
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={config.global.autoSyncVisitedProjects !== false}
              onChange={(e) => onUpdateGlobal({ autoSyncVisitedProjects: e.target.checked })}
            />
            <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        {/* Exclusion / Blacklist */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ShieldBan className="w-3 h-3 text-slate-400" />
              <span>Excluded Projects</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {(config.global.autoSyncBlacklist || []).length} exceptions
            </span>
          </div>

          <form onSubmit={handleAddBlacklist} className="flex gap-1.5">
            <input
              type="text"
              value={newBlacklistEntry}
              onChange={(e) => setNewBlacklistEntry(e.target.value)}
              placeholder="e.g. gitlab.com/company/repo"
              className="flex-1 px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg outline-hidden font-mono focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={!newBlacklistEntry.trim()}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-40 text-white cursor-pointer transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </form>

          {(config.global.autoSyncBlacklist || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
              {config.global.autoSyncBlacklist.map((entry) => (
                <span
                  key={entry}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-mono"
                >
                  <span className="truncate max-w-[170px]">{entry}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlacklist(entry)}
                    className="hover:text-red-500 text-slate-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────
          Category 4: GitLab Auth & Token
         ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold text-xs tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>GitLab Authentication</span>
          </div>
          {authData?.lastUpdated ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Auto-Synced
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Waiting for Visit
            </span>
          )}
        </div>

        {authData?.lastUpdated && (
          <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/70 dark:border-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400">Host:</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{authData.origin || 'gitlab.com'}</span>
            </div>
            {authData.username && (
              <div className="flex justify-between">
                <span className="text-slate-400">User:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">@{authData.username}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Updated:</span>
              <span>{formatTimeAgo(authData.lastUpdated)}</span>
            </div>
          </div>
        )}

        {/* Optional PAT input */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Key className="w-3 h-3 text-slate-400" />
              <span>Personal Access Token</span>
              <span className="text-[10px] text-slate-400">(optional)</span>
            </label>
            {isSavedToken && (
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            <input
              type="password"
              value={patToken}
              onChange={(e) => setPatToken(e.target.value)}
              placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
              className="flex-1 px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg outline-hidden font-mono focus:ring-1 focus:ring-accent"
            />
            <button
              type="button"
              onClick={handleSavePat}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────
          Category 5: Updates & Version
         ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold text-xs tracking-wide">
            <RefreshCw className="w-3.5 h-3.5 text-accent" />
            <span>Updates & Version</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            v{UpdateService.getCurrentVersion()}
          </span>
        </div>

        {/* Auto vs Manual Mode Switch */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="pr-2">
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block">
              Update Check Mode
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              {config.global.autoCheckUpdates !== false
                ? 'Automatically checks GitHub for new releases'
                : 'Manual check only'}
            </span>
          </div>

          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => onUpdateGlobal({ autoCheckUpdates: true })}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                config.global.autoCheckUpdates !== false
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Auto (Default)
            </button>
            <button
              type="button"
              onClick={() => onUpdateGlobal({ autoCheckUpdates: false })}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                config.global.autoCheckUpdates === false
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Manual
            </button>
          </div>
        </div>

        {/* Manual Check Button & Status */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleManualCheck}
            disabled={isCheckingUpdate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-[11px] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isCheckingUpdate ? 'animate-spin text-accent' : ''}`} />
            <span>{isCheckingUpdate ? 'Checking GitHub...' : 'Check for Updates'}</span>
          </button>

          <a
            href="https://github.com/Shariar-Hasan/Gitlab-Automator/releases"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] text-accent hover:underline cursor-pointer"
          >
            <span>Releases Page</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {updateStatusMessage && (
          <div
            className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
              manualCheckResult?.hasUpdate
                ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {manualCheckResult?.hasUpdate ? (
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-accent" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="flex-1">{updateStatusMessage}</span>
            {manualCheckResult?.hasUpdate && (
              <a
                href={manualCheckResult.releaseUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline shrink-0"
              >
                View
              </a>
            )}
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────
          Category 6: Backup & Reset
         ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-2.5">
        <span className="font-semibold text-xs tracking-wide flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
          <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Config & Backup</span>
        </span>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={handleImportClick}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 gap-1 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-[10px] font-medium uppercase">Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={handleExport}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 gap-1 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px] font-medium uppercase">Export</span>
          </button>

          <button
            type="button"
            onClick={handleResetConfirm}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[10px] font-medium uppercase">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
