import { authStorage } from '../shared/storage/authStorage';
import { logger } from '../shared/utils/logger';

export class AuthExtractor {
  /**
   * Automatically scans the current page for GitLab authentication tokens,
   * CSRF tokens, user identity, and cookies, saving them into storage.
   */
  static extractAndSync(): void {
    try {
      // 1. CSRF Token
      const csrfMeta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
      const csrfToken = csrfMeta?.content || undefined;

      // 2. User login / username
      const userMeta = document.querySelector<HTMLMetaElement>('meta[name="user-login"]');
      const username = userMeta?.content || undefined;

      // 3. Optional: check only explicitly documented token keys in localStorage
      // and strictly validate the official GitLab Personal Access Token format (glpat-...)
      let foundToken: string | undefined;
      try {
        const documentedKeys = ['glpat', 'gitlab_pat', 'gitlab_token'];
        for (const key of documentedKeys) {
          const val = localStorage.getItem(key);
          if (val && typeof val === 'string') {
            const cleaned = val.replace(/^["']|["']$/g, '').trim();
            // Strictly validate GitLab Personal Access Token format
            if (/^glpat-[a-zA-Z0-9_\-]{20,250}$/.test(cleaned)) {
              foundToken = cleaned;
              break;
            }
          }
        }
      } catch (e) {
        // localStorage might be restricted in sandboxed contexts
      }

      // 4. Cookies
      const cookies = document.cookie || undefined;

      // 5. Origin
      const origin = window.location.origin;

      if (csrfToken || foundToken || username || cookies) {
        authStorage.saveAuthData({
          csrfToken,
          token: foundToken,
          username,
          cookies,
          origin,
        });
        logger.log('GitLab Auth details auto-extracted & synced', {
          origin,
          hasCsrf: !!csrfToken,
          hasToken: !!foundToken,
          username,
        });
      }
    } catch (e) {
      logger.error('Error extracting auth tokens from page', e);
    }
  }
}
