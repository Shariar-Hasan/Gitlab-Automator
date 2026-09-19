import React, { useEffect, useState } from 'react';
import { ExtensionConfig, DEFAULT_CONFIG, ProjectConfig, GlobalConfig } from '../shared/types';
import { configStorage } from '../shared/storage/configStorage';
import { Header } from './components/Header';
import { Tabs, TabId } from './components/Tabs';
import { CurrentProjectCard } from './components/CurrentProjectCard';
import { ProjectOverrides } from './components/ProjectOverrides';
import { Settings } from './components/Settings';
import { CreateMergeRequestModal } from './components/CreateMergeRequestModal';
import { ProjectSettingsDialog } from './components/ProjectSettingsDialog';
import { UpdateBanner } from './components/UpdateBanner';
import { UpdateService, UpdateCheckResult } from '../shared/services/updateService';
import { getThemeStyles } from '../shared/utils/theme';
import { ConfirmationProvider } from './context/ConfirmationContext';

export default function App() {
  const [config, setConfig] = useState<ExtensionConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [currentTabUrl, setCurrentTabUrl] = useState<string | null>(null);

  // Create MR Modal state
  const [mrModal, setMrModal] = useState<{
    isOpen: boolean;
    projectKey: string;
    targetBranch: string;
    deleteSourceBranch?: boolean;
  }>({
    isOpen: false,
    projectKey: '',
    targetBranch: '',
    deleteSourceBranch: false,
  });

  // Update Check State
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isUpdateDismissed, setIsUpdateDismissed] = useState(false);

  // Project Settings Dialog state
  const [editingProject, setEditingProject] = useState<ProjectConfig | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const savedConfig = await configStorage.getConfig();
      setConfig(savedConfig);

      // Check current tab
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.url && tab.url.includes('gitlab.com')) {
          setCurrentTabUrl(tab.url);
        }
      } catch (e) {
        // Not in extension context or no permission
      }

      setLoading(false);

      // Quietly check for GitHub updates if autoCheckUpdates is enabled (default)
      if (savedConfig.global.autoCheckUpdates !== false) {
        UpdateService.checkForUpdates().then((result) => {
          if (result.hasUpdate) {
            setUpdateInfo(result);
          }
        }).catch(() => {
          // Quiet ignore
        });
      }
    };
    loadData();
  }, []);

  // Synchronize dark mode class and background with html & body to prevent white strips
  useEffect(() => {
    const isDark = config.global.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#020617';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [config.global.theme]);

  const handleGlobalToggle = async (enabled: boolean) => {
    await configStorage.updateGlobalConfig({ enabled });
    setConfig((prev) => ({
      ...prev,
      global: { ...prev.global, enabled },
    }));
  };

  const handleUpdateGlobal = async (updates: Partial<GlobalConfig>) => {
    await configStorage.updateGlobalConfig(updates);
    setConfig((prev) => ({
      ...prev,
      global: { ...prev.global, ...updates },
    }));
  };

  const handleAddProject = async (project: ProjectConfig) => {
    const projectWithTime = {
      ...project,
      updatedAt: project.updatedAt || Date.now(),
    };
    await configStorage.setProjectConfig(project.projectKey, projectWithTime);
    setConfig((prev) => ({
      ...prev,
      projects: { ...prev.projects, [project.projectKey]: projectWithTime },
    }));
  };

  const handleUpdateProject = async (projectKey: string, updates: Partial<ProjectConfig>) => {
    const current = config.projects[projectKey];
    if (current) {
      const updated = { ...current, ...updates, updatedAt: updates.updatedAt || Date.now() };
      await configStorage.setProjectConfig(projectKey, updated);
      setConfig((prev) => ({
        ...prev,
        projects: { ...prev.projects, [projectKey]: updated },
      }));
    }
  };

  const handleMRCreated = async (projectKey: string) => {
    const timestamp = Date.now();
    const current = config.projects[projectKey];
    if (current) {
      await handleUpdateProject(projectKey, {
        last_mr_created_at: timestamp,
        updatedAt: timestamp,
      });
    } else {
      await handleAddProject({
        projectKey,
        targetBranch: config.global.defaultTargetBranch,
        enabled: true,
        last_mr_created_at: timestamp,
        updatedAt: timestamp,
        lastVisited: timestamp,
      });
    }
  };

  const handleDeleteProject = async (projectKey: string) => {
    await configStorage.removeProjectConfig(projectKey);
    setConfig((prev) => {
      const next = { ...prev };
      delete next.projects[projectKey];
      return next;
    });
  };

  const handleReset = async () => {
    await configStorage.resetConfig();
    setConfig(DEFAULT_CONFIG);
  };

  const handleOpenMRModal = (projectKey: string, targetBranch: string) => {
    const project = config.projects[projectKey];
    const shouldDelete =
      project?.deleteSourceBranch !== undefined
        ? project.deleteSourceBranch
        : config.global.defaultDeleteSourceBranch;

    setMrModal({
      isOpen: true,
      projectKey,
      targetBranch: targetBranch || project?.targetBranch || config.global.defaultTargetBranch,
      deleteSourceBranch: shouldDelete,
    });
  };

  const handleAddToException = async (projectKey: string) => {
    const currentBlacklist = config.global.autoSyncBlacklist || [];
    const updatedBlacklist = Array.from(new Set([...currentBlacklist, projectKey]));
    await configStorage.updateGlobalConfig({ autoSyncBlacklist: updatedBlacklist });
    await configStorage.removeProjectConfig(projectKey);

    setConfig((prev) => {
      const nextProjects = { ...prev.projects };
      delete nextProjects[projectKey];
      return {
        ...prev,
        global: {
          ...prev.global,
          autoSyncBlacklist: updatedBlacklist,
        },
        projects: nextProjects,
      };
    });
  };

  const handleCloseMRModal = () => {
    setMrModal((prev) => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] w-[380px] text-xs text-slate-500">
        Loading...
      </div>
    );
  }

  const isDarkMode = config.global.theme === 'dark';
  const themeStyles = getThemeStyles(config.global.accentColor || '#2563eb');

  return (
    <ConfirmationProvider>
      <div
        className={isDarkMode ? 'dark' : ''}
        style={themeStyles}
        data-radius={config.global.borderRadius || 'md'}
      >
        <div className="w-[430px] min-h-[500px] max-h-[600px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden antialiased">
          {/* Top Update Alert Banner */}
          {updateInfo?.hasUpdate && !isUpdateDismissed && (
            <UpdateBanner
              updateInfo={updateInfo}
              onDismiss={() => setIsUpdateDismissed(true)}
            />
          )}

          {/* Header with Global ON/OFF Switch */}
          <Header enabled={config.global.enabled} onToggle={handleGlobalToggle} />

          {/* Tab Switcher */}
          <div className="px-3.5 pt-3">
            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content Body */}
          <div className="p-3.5 flex-1 overflow-y-auto space-y-3.5">
            {activeTab === 'home' ? (
              <>
                {currentTabUrl && (
                  <CurrentProjectCard
                    url={currentTabUrl}
                    projects={config.projects}
                    globalConfig={config.global}
                    onAdd={handleAddProject}
                    disabled={!config.global.enabled}
                    onAddToException={handleAddToException}
                  />
                )}

                <ProjectOverrides
                  projects={config.projects}
                  onUpdate={handleUpdateProject}
                  onDelete={handleDeleteProject}
                  onAdd={handleAddProject}
                  disabled={!config.global.enabled}
                  onCreateMR={handleOpenMRModal}
                  onOpenProjectSettings={(proj) => setEditingProject(proj)}
                />
              </>
            ) : (
              <Settings
                config={config}
                onImport={(newConfig) => {
                  configStorage.importConfig(newConfig).then(() => setConfig(newConfig));
                }}
                onReset={handleReset}
                onUpdateGlobal={handleUpdateGlobal}
                updateInfo={updateInfo}
                onUpdateFound={(result) => {
                  setUpdateInfo(result);
                  setIsUpdateDismissed(false);
                }}
              />
            )}
          </div>

          {/* Project Customization Dialog */}
          <ProjectSettingsDialog
            isOpen={!!editingProject}
            project={editingProject}
            globalDefaultBranch={config.global.defaultTargetBranch}
            onSave={handleUpdateProject}
            onClose={() => setEditingProject(null)}
          />

          {/* Create Merge Request Modal */}
          <CreateMergeRequestModal
            isOpen={mrModal.isOpen}
            projectKey={mrModal.projectKey}
            defaultTargetBranch={mrModal.targetBranch}
            defaultDeleteSourceBranch={mrModal.deleteSourceBranch}
            onClose={handleCloseMRModal}
            onSubmitMR={handleMRCreated}
          />
        </div>
      </div>
    </ConfirmationProvider>
  );
}
