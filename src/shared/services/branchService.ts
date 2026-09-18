import { authStorage } from '../storage/authStorage';
import { configStorage } from '../storage/configStorage';
import { logger } from '../utils/logger';

// In-memory cache for fast search queries
const branchCache = new Map<string, { timestamp: number; branches: string[] }>();
const CACHE_TTL = 30000; // 30 seconds

export class BranchService {
  /**
   * Search branches for a given projectKey (e.g. "gitlab.com/group/project")
   */
  static async searchBranches(projectKey: string, query: string = ''): Promise<string[]> {
    const trimmedQuery = query.trim().toLowerCase();
    const cacheKey = `${projectKey}::${trimmedQuery}`;
    
    // Check cache
    const cached = branchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.branches;
    }

    try {
      const parts = projectKey.split('/');
      const host = parts[0] || 'gitlab.com';
      const projectPath = parts.slice(1).join('/');

      let results: string[] = [];

      // 1. Try In-tab bridge first (uses the active logged-in browser session directly)
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (activeTab?.id && activeTab?.url && activeTab.url.includes(host)) {
          const response = await new Promise<any>((resolve) => {
            chrome.tabs.sendMessage(
              activeTab.id!,
              { action: 'SEARCH_BRANCHES', projectPath, query: trimmedQuery },
              (res) => {
                if (chrome.runtime.lastError) {
                  resolve(null);
                } else {
                  resolve(res);
                }
              }
            );
          });

          if (response?.success && Array.isArray(response.branches) && response.branches.length > 0) {
            results = response.branches;
          }
        }
      } catch (e) {
        // Fallback to direct fetch
      }

      // 2. Direct API fetch if in-tab bridge returned no branches
      if (results.length === 0) {
        results = await this.fetchDirectBranches(host, projectPath, trimmedQuery);
      }

      // Filter and deduplicate
      const uniqueBranches = Array.from(new Set(results));
      const filtered = trimmedQuery
        ? uniqueBranches.filter((b) => b.toLowerCase().includes(trimmedQuery))
        : uniqueBranches;

      // Save to cache
      branchCache.set(cacheKey, { timestamp: Date.now(), branches: filtered });

      return filtered;
    } catch (err) {
      logger.error('Failed to search branches', err);
      return [];
    }
  }

  private static async fetchDirectBranches(host: string, projectPath: string, query: string): Promise<string[]> {
    const config = await configStorage.getConfig();
    const authData = await authStorage.getAuthData();

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    const rawToken = config.global.personalAccessToken || authData?.token;
    const token = rawToken?.trim();
    if (token && (/^glpat-[a-zA-Z0-9_-]{20,250}$/.test(token) || /^[a-zA-Z0-9_-]{20,250}$/.test(token))) {
      headers['PRIVATE-TOKEN'] = token;
    }
    if (authData?.csrfToken) {
      headers['X-CSRF-Token'] = authData.csrfToken;
    }

    const branches: string[] = [];

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

    // Attempt 1 (Primary): https://gitlab.com/{projectPath}/refs?search=
    try {
      const refsUrl = `https://${host}/${projectPath}/refs?search=${encodeURIComponent(query)}`;
      const res = await fetch(refsUrl, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        branches.push(...extractBranches(data));
      }
    } catch (e) {
      // ref endpoint failed
    }

    if (branches.length > 0) {
      return branches;
    }

    // Attempt 2: https://gitlab.com/{projectPath}/-/refs?type=heads&search=
    try {
      const refsUrl2 = `https://${host}/${projectPath}/-/refs?type=heads&search=${encodeURIComponent(query)}`;
      const res = await fetch(refsUrl2, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        branches.push(...extractBranches(data));
      }
    } catch (e) {
      // fallback
    }

    if (branches.length > 0) {
      return branches;
    }

    // Attempt 3: GitLab REST API v4
    try {
      const apiUrl = `https://${host}/api/v4/projects/${encodeURIComponent(projectPath)}/repository/branches?search=${encodeURIComponent(query)}&per_page=30`;
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        branches.push(...extractBranches(data));
      }
    } catch (e) {
      // API call failed
    }

    return branches;
  }
}
