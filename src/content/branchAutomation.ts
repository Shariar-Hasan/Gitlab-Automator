import { ExtensionConfig } from '../shared/types';
import { logger } from '../shared/utils/logger';

export function resolveTargetBranch(config: ExtensionConfig, projectKey: string | null): string | null {
  if (!config.global.enabled) {
    logger.log('Global automation is disabled');
    return null;
  }

  if (projectKey && config.projects[projectKey]) {
    const projectConfig = config.projects[projectKey];
    if (!projectConfig.enabled) {
      logger.log(`Automation disabled for project ${projectKey}`);
      return null;
    }
    logger.log(`Using project override for ${projectKey}: ${projectConfig.targetBranch}`);
    return projectConfig.targetBranch;
  }

  logger.log(`Using global default branch: ${config.global.defaultTargetBranch}`);
  return config.global.defaultTargetBranch;
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

  // Case B: Already on correct target
  if (currentTargetBranch === resolvedBranch) {
    logger.log('Already on correct target branch');
    return false;
  }

  // Case C: development -> main (or any branch merging into default and user hasn't explicitly changed it? No, if source == resolved, don't change)
  if (sourceBranch === resolvedBranch) {
    logger.log('Source branch equals resolved target branch. Doing nothing.');
    return false;
  }

  // Case D: User intentionally selected another branch.
  // We determine this if currentTarget is NOT the gitlab default (usually main/master) and NOT null.
  // Actually, if we just arrived on the page, the URL will either lack a target branch, or have the gitlab default.
  // To avoid overriding intentional user selection, we use sessionStorage to mark if we already did our automation for this MR session.
  if (sessionStorage.getItem('gitlab_automator_switched') === 'true') {
    logger.log('Automation already ran for this session. Respecting current selection.');
    return false;
  }

  // If there's a target branch in the URL and we haven't switched it, it might be an explicit link or default.
  // We'll proceed to switch, but we'll mark that we did it.
  
  return true;
}
