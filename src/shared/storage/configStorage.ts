import { ExtensionConfig, DEFAULT_CONFIG, GlobalConfig, ProjectConfig } from "../types";
import { logger, setDebugEnabled } from "../utils/logger";

const STORAGE_KEY = "gitlab_automator_config";

export const configStorage = {
  async getConfig(): Promise<ExtensionConfig> {
    try {
      const data = await chrome.storage.sync.get(STORAGE_KEY);
      const config = data[STORAGE_KEY] as ExtensionConfig | undefined;
      
      const mergedConfig = {
        ...DEFAULT_CONFIG,
        ...config,
        global: {
          ...DEFAULT_CONFIG.global,
          ...config?.global,
        },
        projects: {
          ...DEFAULT_CONFIG.projects,
          ...config?.projects,
        },
      };

      setDebugEnabled(mergedConfig.global.enableDebugLogging);
      return mergedConfig;
    } catch (e) {
      logger.error("Failed to get config", e);
      return DEFAULT_CONFIG;
    }
  },

  async updateGlobalConfig(globalConfig: Partial<GlobalConfig>): Promise<void> {
    const config = await this.getConfig();
    config.global = { ...config.global, ...globalConfig };
    await this.saveConfig(config);
    setDebugEnabled(config.global.enableDebugLogging);
  },

  async getProjectConfig(projectKey: string): Promise<ProjectConfig | undefined> {
    const config = await this.getConfig();
    return config.projects[projectKey];
  },

  async setProjectConfig(projectKey: string, projectConfig: ProjectConfig): Promise<void> {
    const config = await this.getConfig();
    config.projects[projectKey] = {
      ...projectConfig,
      updatedAt: projectConfig.updatedAt || Date.now(),
    };
    await this.saveConfig(config);
  },

  async recordMrCreated(projectKey: string): Promise<void> {
    const config = await this.getConfig();
    const existing = config.projects[projectKey];
    const timestamp = Date.now();
    if (existing) {
      existing.last_mr_created_at = timestamp;
      existing.updatedAt = timestamp;
      await this.saveConfig(config);
    } else {
      config.projects[projectKey] = {
        projectKey,
        targetBranch: config.global.defaultTargetBranch,
        enabled: true,
        last_mr_created_at: timestamp,
        updatedAt: timestamp,
        lastVisited: timestamp,
      };
      await this.saveConfig(config);
    }
  },

  async addVisitedProject(projectKey: string): Promise<void> {
    const config = await this.getConfig();
    const existing = config.projects[projectKey];
    const now = Date.now();
    
    if (existing) {
      existing.lastVisited = now;
      existing.updatedAt = now;
    } else {
      config.projects[projectKey] = {
        projectKey,
        targetBranch: config.global.defaultTargetBranch,
        enabled: true,
        lastVisited: now,
        updatedAt: now,
      };
    }
    await this.saveConfig(config);
  },

  async removeProjectConfig(projectKey: string): Promise<void> {
    const config = await this.getConfig();
    delete config.projects[projectKey];
    await this.saveConfig(config);
  },

  async importConfig(newConfig: ExtensionConfig): Promise<void> {
    if (newConfig && newConfig.global && typeof newConfig.global.enabled === 'boolean') {
      await this.saveConfig(newConfig);
    } else {
      throw new Error("Invalid configuration format");
    }
  },

  async resetConfig(): Promise<void> {
    await this.saveConfig(DEFAULT_CONFIG);
  },

  async saveConfig(config: ExtensionConfig): Promise<void> {
    try {
      await chrome.storage.sync.set({ [STORAGE_KEY]: config });
    } catch (e) {
      logger.error("Failed to save config", e);
    }
  }
};
