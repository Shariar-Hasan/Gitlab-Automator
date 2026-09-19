export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  releaseName?: string;
  publishedAt?: string;
  checkedAt: number;
}

const GITHUB_REPO = 'Shariar-Hasan/Gitlab-Automator';
const DEFAULT_RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`;
const CACHE_STORAGE_KEY = 'gitlab_automator_update_cache';

export function compareVersions(v1: string, v2: string): number {
  const clean = (v: string) => v.replace(/^v/i, '').trim();
  const parts1 = clean(v1).split('.').map((n) => parseInt(n, 10) || 0);
  const parts2 = clean(v2).split('.').map((n) => parseInt(n, 10) || 0);
  const maxLen = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLen; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

export function getCurrentVersion(): string {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getManifest) {
      return chrome.runtime.getManifest().version || '2.0.0';
    }
  } catch (e) {
    // ignore
  }
  return '2.0.0';
}

export const UpdateService = {
  getCurrentVersion,
  compareVersions,

  async checkForUpdates(force = false): Promise<UpdateCheckResult> {
    const currentVersion = getCurrentVersion();
    const now = Date.now();

    // Check cached result if recent (< 30 minutes) and not forced
    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(CACHE_STORAGE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as UpdateCheckResult;
          if (cached && now - cached.checkedAt < 30 * 60 * 1000) {
            // Re-evaluate hasUpdate with currentVersion in case version changed
            return {
              ...cached,
              currentVersion,
              hasUpdate: compareVersions(cached.latestVersion, currentVersion) > 0,
            };
          }
        }
      } catch (e) {
        // ignore cache read errors
      }
    }

    let latestVersion = currentVersion;
    let releaseUrl = DEFAULT_RELEASES_URL;
    let releaseName = '';
    let publishedAt = '';

    // Strategy 1: GitHub Releases API (/releases/latest)
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (res.ok) {
        const data = await res.json();
        const tag = (data.tag_name || data.name || '').replace(/^v/i, '').trim();
        if (tag) {
          latestVersion = tag;
          releaseUrl = data.html_url || DEFAULT_RELEASES_URL;
          releaseName = data.name || data.tag_name || '';
          publishedAt = data.published_at || '';
        }
      } else if (res.status === 404) {
        // No formal GitHub release published yet, fallback to raw package.json on main branch
        const rawRes = await fetch(
          `https://raw.githubusercontent.com/${GITHUB_REPO}/main/package.json`
        );
        if (rawRes.ok) {
          const pkg = await rawRes.json();
          if (pkg.version) {
            latestVersion = pkg.version;
            releaseUrl = DEFAULT_RELEASES_URL;
          }
        }
      }
    } catch (err) {
      // Quietly handle network failure or rate limits
      console.debug('GitLab Automator: Quiet update check failed (offline or rate limit)', err);
    }

    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    const result: UpdateCheckResult = {
      hasUpdate,
      currentVersion,
      latestVersion,
      releaseUrl,
      releaseName: releaseName || `v${latestVersion}`,
      publishedAt,
      checkedAt: now,
    };

    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(result));
    } catch (e) {
      // ignore
    }

    return result;
  },
};
