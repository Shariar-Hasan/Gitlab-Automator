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

      // 3. Check localStorage for tokens
      let foundToken: string | undefined;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          const lowerKey = key.toLowerCase();
          if (
            lowerKey.includes('token') ||
            lowerKey.includes('pat') ||
            lowerKey.includes('glpat') ||
            lowerKey.includes('auth') ||
            lowerKey.includes('access')
          ) {
            const val = localStorage.getItem(key);
            if (val && typeof val === 'string' && val.length >= 10 && val.length < 500) {
              // Found potential token
              foundToken = val.replace(/^["']|["']$/g, '');
              break;
            }
          }
        }
      } catch (e) {
        // localStorage might be blocked in some iframes
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
