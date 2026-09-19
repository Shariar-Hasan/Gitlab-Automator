import { configStorage } from '../shared/storage/configStorage';
import { GitLabAdapter } from './GitLabAdapter';
import { resolveTargetBranchAndOptions, shouldSwitchBranch } from './branchAutomation';
import { NavigationObserver } from './navigationObserver';
import { LoadingOverlay } from './overlay/loadingOverlay';
import { logger } from '../shared/utils/logger';

import { AuthExtractor } from './authExtractor';

const overlay = new LoadingOverlay();

// Listen for branch search requests from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'SEARCH_BRANCHES') {
    const { projectPath, query } = message;

    (async () => {
      try {
        const branches: string[] = [];

        // Helper to extract branch names from various GitLab ref response formats
        const extractBranches = (data: any): string[] => {
          const list: string[] = [];
          if (!data) return list;

          if (Array.isArray(data)) {
            data.forEach((b: any) => {
              if (typeof b === 'string') list.push(b);
              else if (b && typeof b === 'object') {
                const name = b.name || b.id || b.text || b.title;
                if (name && typeof name === 'string') list.push(name);
              }
            });
          } else if (typeof data === 'object') {
            const branchArray = data.Branches || data.branches || (Array.isArray(data) ? data : null);
            if (Array.isArray(branchArray)) {
              branchArray.forEach((b: any) => {
                if (typeof b === 'string') list.push(b);
                else if (b?.name) list.push(b.name);
                else if (b?.id) list.push(b.id);
                else if (b?.text) list.push(b.text);
              });
            } else {
              for (const val of Object.values(data)) {
                if (Array.isArray(val)) {
                  val.forEach((b: any) => {
                    if (typeof b === 'string') list.push(b);
                    else if (b?.name) list.push(b.name);
                  });
                }
              }
            }
          }
          return list;
        };

        // 1. Primary: /{projectPath}/refs?search=
        try {
          const refRes = await fetch(
            `/${projectPath}/refs?search=${encodeURIComponent(query || '')}`,
            { credentials: 'include' }
          );
          if (refRes.ok) {
            const data = await refRes.json();
            branches.push(...extractBranches(data));
          }
        } catch (e) {
          // ignore
        }

        // 2. Fallback: /{projectPath}/-/refs?type=heads&search=
        if (branches.length === 0) {
          try {
            const refRes2 = await fetch(
              `/${projectPath}/-/refs?type=heads&search=${encodeURIComponent(query || '')}`,
              { credentials: 'include' }
            );
            if (refRes2.ok) {
              const data = await refRes2.json();
              branches.push(...extractBranches(data));
            }
          } catch (e) {
            // ignore
          }
        }

        // 3. Fallback: GitLab REST API v4
        if (branches.length === 0) {
          try {
            const apiRes = await fetch(
              `/api/v4/projects/${encodeURIComponent(projectPath)}/repository/branches?search=${encodeURIComponent(query || '')}&per_page=30`,
              { credentials: 'include' }
            );
            if (apiRes.ok) {
              const data = await apiRes.json();
              branches.push(...extractBranches(data));
            }
          } catch (e) {
            // ignore
          }
        }

        sendResponse({ success: true, branches });
      } catch (err: any) {
        sendResponse({ success: false, error: err?.message || 'Branch search failed' });
      }
    })();

    return true; // Keep message channel open for async response
  }
});

async function runAutomation() {
  // Sync GitLab auth/cookies/csrf whenever on a GitLab page
  AuthExtractor.extractAndSync();

  const config = await configStorage.getConfig();
  const projectKey = GitLabAdapter.getProjectKey();

  if (projectKey) {
    const isAutoSyncEnabled = config.global.autoSyncVisitedProjects !== false;
    const isBlacklisted = config.global.autoSyncBlacklist?.includes(projectKey);

    if (isAutoSyncEnabled && !isBlacklisted) {
      // Auto-detect and save the project silently in the background
      await configStorage.addVisitedProject(projectKey);
      logger.log(`Auto-saved visited project: ${projectKey}`);
    } else {
      logger.log(`Skipped auto-saving project ${projectKey} (autoSync: ${isAutoSyncEnabled}, blacklisted: ${isBlacklisted})`);
    }
  }

  if (!GitLabAdapter.isMergeRequestCreationPage()) {
    // If we left the MR creation page, reset the session storage guard
    if (!window.location.pathname.includes('/merge_requests/new')) {
      sessionStorage.removeItem('gitlab_automator_switched');
    }
    return;
  }

  logger.log('Detected MR creation page');

  // 1. Strict check: Query params MUST contain source branch. If absent, do not run automation!
  const sourceBranch = GitLabAdapter.getSourceBranch();
  if (!sourceBranch) {
    logger.log('No source branch found in query params. Skipping branch automation.');
    return;
  }

  const currentTargetBranch = GitLabAdapter.getTargetBranch();

  logger.log('State:', { projectKey, sourceBranch, currentTargetBranch });

  const { targetBranch: resolvedBranch, deleteSourceBranch } = resolveTargetBranchAndOptions(
    config,
    projectKey,
    sourceBranch
  );

  logger.log('Branch resolution:', { sourceBranch, currentTargetBranch, resolvedBranch, deleteSourceBranch });

  // 2. Strict check: If no rule matched the source branch ("ba na mile"), do not run automation!
  if (!resolvedBranch) {
    logger.log(`No routing rule matched for source branch "${sourceBranch}". Skipping branch automation.`);
    return;
  }

  if (shouldSwitchBranch(sourceBranch, currentTargetBranch, resolvedBranch)) {
    logger.log(`Switching target branch to ${resolvedBranch} (deleteSource: ${deleteSourceBranch})`);

    // Show full-page overlay
    overlay.show(sourceBranch, resolvedBranch, {
      theme: config.global.theme,
      accentColor: config.global.accentColor,
      borderRadius: config.global.borderRadius,
    });

    // Mark as switched in this session to prevent loops
    sessionStorage.setItem('gitlab_automator_switched', 'true');

    // Make the switch with target branch and delete source branch in URL
    setTimeout(() => {
      GitLabAdapter.setTargetBranch(resolvedBranch, sourceBranch, deleteSourceBranch);
      setTimeout(() => overlay.hide(), 2500);
    }, 350);
  } else {
    // Already on correct target branch: ensure delete source branch checkbox matches rule
    GitLabAdapter.setDeleteSourceBranch(deleteSourceBranch);
  }
}

// Start observing navigation
const navObserver = new NavigationObserver(() => {
  runAutomation();
});

navObserver.start();
