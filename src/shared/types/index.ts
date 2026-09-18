export interface GlobalConfig {
  enabled: boolean;
  defaultTargetBranch: string;
  enableDebugLogging: boolean;
  personalAccessToken?: string;
  theme: 'light' | 'dark';
  accentColor?: string; // Hex color code for UI primary theme
  borderRadius?: 'none' | 'sm' | 'md'; // Corner rounding style
  autoSyncVisitedProjects: boolean;
  autoSyncBlacklist: string[];
  defaultDeleteSourceBranch: boolean;
}

export interface GitLabAuthData {
  csrfToken?: string;
  token?: string;
  cookies?: string;
  origin?: string;
  lastUpdated: number;
  username?: string;
}

export interface ProjectConfig {
  projectKey: string;
  projectName?: string;
  customName?: string;
  colorTag?: string; // e.g. 'blue', 'purple', 'emerald', 'amber', 'rose', 'slate'
  targetBranch: string;
  enabled: boolean;
  deleteSourceBranch?: boolean;
  lastVisited?: number;
}

export interface ExtensionConfig {
  version: number;
  global: GlobalConfig;
  projects: Record<string, ProjectConfig>;
}

export const DEFAULT_CONFIG: ExtensionConfig = {
  version: 1,
  global: {
    enabled: true,
    defaultTargetBranch: "development",
    enableDebugLogging: false,
    theme: "light",
    accentColor: "#2563eb",
    borderRadius: "md",
    autoSyncVisitedProjects: true,
    autoSyncBlacklist: [],
    defaultDeleteSourceBranch: false,
  },
  projects: {},
};
