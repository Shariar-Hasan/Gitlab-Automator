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
    try {
      const url = new URL(window.location.href);
      // Strictly check URL query parameters for source branch
      const source = url.searchParams.get('merge_request[source_branch]') || 
                     url.searchParams.get('source_branch');
      return source?.trim() || null;
    } catch {
      return null;
    }
  }

  static getTargetBranch(): string | null {
    try {
      const url = new URL(window.location.href);
      const target = url.searchParams.get('merge_request[target_branch]') || 
                     url.searchParams.get('target_branch');
      return target?.trim() || null;
    } catch {
      return null;
    }
  }

  static setTargetBranch(targetBranch: string, sourceBranch?: string, deleteSourceBranch?: boolean): void {
    const url = new URL(window.location.href);
    if (sourceBranch) {
      url.searchParams.set('merge_request[source_branch]', sourceBranch);
    }
    url.searchParams.set('merge_request[target_branch]', targetBranch);
    if (deleteSourceBranch !== undefined) {
      url.searchParams.set('merge_request[force_remove_source_branch]', deleteSourceBranch ? 'true' : 'false');
    }
    
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
