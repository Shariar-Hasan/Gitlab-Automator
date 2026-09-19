export interface BranchRule {
  id: string;
  sourcePattern: string; // e.g. "development", "*", "feat/*", "release/*"
  targetBranch: string;  // e.g. "main", "development", "staging"
  deleteSourceBranch?: boolean; // undefined = inherit, true = always delete, false = keep
}

export const DEFAULT_BRANCH_RULES: BranchRule[] = [
  {
    id: 'default-rule-dev-to-main',
    sourcePattern: 'development',
    targetBranch: 'main',
  },
  {
    id: 'default-rule-any-to-dev',
    sourcePattern: '*',
    targetBranch: 'development',
  },
];

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
  autoCheckUpdates?: boolean;
  lastUpdateCheckTime?: number;
  branchRules?: BranchRule[];
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
  last_mr_created_at?: number;
  updatedAt?: number;
  branchRules?: BranchRule[];
  useCustomBranchRules?: boolean;
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
    autoCheckUpdates: true,
    branchRules: DEFAULT_BRANCH_RULES,
  },
  projects: {},
};
