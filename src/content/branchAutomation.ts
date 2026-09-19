import { ExtensionConfig, BranchRule, DEFAULT_BRANCH_RULES } from '../shared/types';
import { logger } from '../shared/utils/logger';

export interface BranchResolutionResult {
  targetBranch: string | null;
  deleteSourceBranch: boolean;
  matchedRule?: BranchRule;
}

export function matchBranchPattern(pattern: string, branch: string | null): boolean {
  if (!pattern || !branch) return false;
  const p = pattern.trim();
  const b = branch.trim();

  if (p === '*' || p.toLowerCase() === 'any') return true;
  if (p.toLowerCase() === b.toLowerCase()) return true;

  // Wildcard match (e.g., feat/*, hotfix/*, release/*)
  if (p.includes('*')) {
    const escaped = p.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');
    try {
      return new RegExp(`^${escaped}$`, 'i').test(b);
    } catch {
      return false;
    }
  }

  return false;
}

export function resolveTargetBranchAndOptions(
  config: ExtensionConfig,
  projectKey: string | null,
  sourceBranch: string | null
): BranchResolutionResult {
  const defaultDelete = config.global.defaultDeleteSourceBranch ?? false;

  if (!config.global.enabled) {
    logger.log('Global automation is disabled');
    return { targetBranch: null, deleteSourceBranch: defaultDelete };
  }

  const project = projectKey ? config.projects[projectKey] : null;
  if (project && !project.enabled) {
    logger.log(`Automation disabled for project ${projectKey}`);
    return { targetBranch: null, deleteSourceBranch: defaultDelete };
  }

  const projectDelete = project?.deleteSourceBranch !== undefined ? project.deleteSourceBranch : defaultDelete;

  // 1. Determine active rules (Project custom rules vs Global rules)
  let activeRules: BranchRule[] = [];
  if (project?.useCustomBranchRules && project.branchRules && project.branchRules.length > 0) {
    activeRules = project.branchRules;
    logger.log(`Using project-specific branch rules (${activeRules.length}) for ${projectKey}`);
  } else {
    activeRules = config.global.branchRules && config.global.branchRules.length > 0
      ? config.global.branchRules
      : DEFAULT_BRANCH_RULES;
    logger.log(`Using global branch rules (${activeRules.length})`);
  }

  // 2. Evaluate rules against sourceBranch
  if (sourceBranch) {
    for (const rule of activeRules) {
      if (matchBranchPattern(rule.sourcePattern, sourceBranch)) {
        // Prevent targeting the exact same branch as source
        if (rule.targetBranch.toLowerCase() !== sourceBranch.toLowerCase()) {
          const deleteSource = rule.deleteSourceBranch !== undefined ? rule.deleteSourceBranch : projectDelete;
          logger.log(`Matched rule [${rule.sourcePattern} -> ${rule.targetBranch}] for source "${sourceBranch}"`);
          return {
            targetBranch: rule.targetBranch,
            deleteSourceBranch: deleteSource,
            matchedRule: rule,
          };
        }
      }
    }
  }

  // 3. Fallback logic
  // Default requirement: source "development" -> target "main", source any other -> "development"
  let fallbackTarget = config.global.defaultTargetBranch || 'development';
  if (sourceBranch?.toLowerCase() === 'development') {
    fallbackTarget = 'main';
  } else if (project?.targetBranch) {
    fallbackTarget = project.targetBranch;
  }

  // Ensure fallback doesn't target source itself
  if (sourceBranch && fallbackTarget.toLowerCase() === sourceBranch.toLowerCase()) {
    fallbackTarget = fallbackTarget.toLowerCase() === 'development' ? 'main' : 'development';
  }

  logger.log(`Fallback target branch: ${fallbackTarget}`);
  return {
    targetBranch: fallbackTarget,
    deleteSourceBranch: projectDelete,
  };
}

// Backward compatibility helper
export function resolveTargetBranch(
  config: ExtensionConfig,
  projectKey: string | null,
  sourceBranch: string | null = null
): string | null {
  return resolveTargetBranchAndOptions(config, projectKey, sourceBranch).targetBranch;
}

export function shouldSwitchBranch(
  sourceBranch: string | null,
  currentTargetBranch: string | null,
  resolvedBranch: string | null
): boolean {
  if (!resolvedBranch) return false;

  if (!sourceBranch) {
    logger.log('Source branch not found, cannot determine if we should switch');
    return false;
  }

  // Case: Already on correct target
  if (currentTargetBranch === resolvedBranch) {
    logger.log(`Already on correct target branch: ${resolvedBranch}`);
    return false;
  }

  // Case: Source branch equals resolved target branch
  if (sourceBranch.toLowerCase() === resolvedBranch.toLowerCase()) {
    logger.log('Source branch equals resolved target branch. Doing nothing.');
    return false;
  }

  // Case: User intentionally selected another branch in this session
  if (sessionStorage.getItem('gitlab_automator_switched') === 'true') {
    logger.log('Automation already ran for this session. Respecting current selection.');
    return false;
  }

  return true;
}
