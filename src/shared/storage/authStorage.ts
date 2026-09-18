import { GitLabAuthData } from "../types";
import { logger } from "../utils/logger";

const AUTH_STORAGE_KEY = "gitlab_automator_auth";

export const authStorage = {
  async getAuthData(): Promise<GitLabAuthData | null> {
    try {
      const data = await chrome.storage.local.get(AUTH_STORAGE_KEY);
      return (data[AUTH_STORAGE_KEY] as GitLabAuthData) || null;
    } catch (e) {
      logger.error("Failed to get auth data from storage", e);
      return null;
    }
  },

  async saveAuthData(updates: Partial<GitLabAuthData>): Promise<void> {
    try {
      const current = (await this.getAuthData()) || { lastUpdated: 0 };
      const updated: GitLabAuthData = {
        ...current,
        ...updates,
        lastUpdated: Date.now(),
      };
      await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: updated });
      logger.log("Updated GitLab auth data in storage", {
        hasCsrf: !!updated.csrfToken,
        hasToken: !!updated.token,
        username: updated.username,
        lastUpdated: updated.lastUpdated,
      });
    } catch (e) {
      logger.error("Failed to save auth data to storage", e);
    }
  },

  async clearAuthData(): Promise<void> {
    try {
      await chrome.storage.local.remove(AUTH_STORAGE_KEY);
      logger.log("Cleared GitLab auth data");
    } catch (e) {
      logger.error("Failed to clear auth data", e);
    }
  },
};
