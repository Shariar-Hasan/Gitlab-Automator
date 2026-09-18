export class GitLabAdapter {
  static isMergeRequestCreationPage(): boolean {
    // Check URL pattern
    const url = new URL(window.location.href);
    return url.pathname.includes('/-/merge_requests/new');
  }

  static getProjectKey(): string | null {
    try {
      const urlObj = new URL(window.location.href);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const dashIndex = pathParts.indexOf('-');
      if (dashIndex > -1) {
        const projectParts = pathParts.slice(0, dashIndex);
        return `${urlObj.host}/${projectParts.join('/')}`;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  static getSourceBranch(): string | null {
    const url = new URL(window.location.href);
    const sourceFromUrl = url.searchParams.get('merge_request[source_branch]');
    if (sourceFromUrl) return sourceFromUrl;

    // Fallback to DOM if needed, but GitLab usually puts it in URL on MR creation
    const sourceEl = document.querySelector('[data-testid="source-branch-name"]') || 
                     document.querySelector('.js-source-branch');
    return sourceEl?.textContent?.trim() || null;
  }

  static getTargetBranch(): string | null {
    const url = new URL(window.location.href);
    const targetFromUrl = url.searchParams.get('merge_request[target_branch]');
    if (targetFromUrl) return targetFromUrl;

    // Default usually is not in URL initially if it's falling back to project default
    return null;
  }

  static setTargetBranch(branch: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set('merge_request[target_branch]', branch);
    
    // We navigate to the new URL to force GitLab to load the MR with this target
    window.location.replace(url.toString());
  }

  static setDeleteSourceBranch(shouldDelete: boolean): void {
    const checkbox = document.querySelector<HTMLInputElement>('#merge_request_force_remove_source_branch');
    if (checkbox) {
      checkbox.checked = shouldDelete;
    }
  }

  static uncheckDeleteSourceBranch(): void {
    this.setDeleteSourceBranch(false);
  }
}
