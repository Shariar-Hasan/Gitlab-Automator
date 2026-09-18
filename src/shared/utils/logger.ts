import { GlobalConfig } from "../types";

let debugEnabled = false;

export const setDebugEnabled = (enabled: boolean) => {
  debugEnabled = enabled;
};

export const logger = {
  log: (...args: any[]) => {
    if (debugEnabled) {
      console.log("[GitLab Automator]", ...args);
    }
  },
  warn: (...args: any[]) => {
    if (debugEnabled) {
      console.warn("[GitLab Automator]", ...args);
    }
  },
  error: (...args: any[]) => {
    console.error("[GitLab Automator]", ...args);
  },
};
