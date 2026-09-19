export interface LoadingOverlayOptions {
  theme?: 'light' | 'dark';
  accentColor?: string;
  borderRadius?: 'none' | 'sm' | 'md';
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

export class LoadingOverlay {
  private overlay: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;

  show(sourceBranch: string, targetBranch: string, options?: LoadingOverlayOptions) {
    if (this.overlay) return;

    const theme = options?.theme || 'light';
    const isDark = theme === 'dark';
    const accent = options?.accentColor || '#2563eb';
    const accentLight = hexToRgba(accent, 0.12);
    const accentBorder = hexToRgba(accent, 0.28);

    const cardRadius = options?.borderRadius === 'none' ? '4px' : options?.borderRadius === 'sm' ? '8px' : '16px';
    const branchesRadius = options?.borderRadius === 'none' ? '2px' : options?.borderRadius === 'sm' ? '6px' : '10px';

    this.overlay = document.createElement('div');
    this.overlay.id = 'gitlab-automator-overlay-root';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647; /* Highest priority overlay */
      pointer-events: auto;
    `;

    this.shadowRoot = this.overlay.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        --accent: ${accent};
        --accent-light: ${accentLight};
        --accent-border: ${accentBorder};
        --bg-card: ${isDark ? '#0f172a' : '#ffffff'};
        --border-card: ${isDark ? '#334155' : '#e2e8f0'};
        --text-primary: ${isDark ? '#f8fafc' : '#0f172a'};
        --text-secondary: ${isDark ? '#94a3b8' : '#64748b'};
        --bg-branches: ${isDark ? '#1e293b' : '#f8fafc'};
        --border-branches: ${isDark ? '#334155' : '#e2e8f0'};
        --text-source-branch: ${isDark ? '#e2e8f0' : '#1e293b'};
        --text-arrow: ${isDark ? '#64748b' : '#94a3b8'};
        --card-radius: ${cardRadius};
        --branches-radius: ${branchesRadius};
        --spinner-track: ${isDark ? '#334155' : '#e2e8f0'};
        --box-shadow: ${isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.65)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'};
      }
      .overlay-bg {
        position: fixed;
        inset: 0;
        background-color: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        animation: fadeIn 0.15s ease-out;
      }
      .card {
        background: var(--bg-card);
        border-radius: var(--card-radius);
        padding: 24px;
        box-shadow: var(--box-shadow);
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 360px;
        width: 90%;
        border: 1px solid var(--border-card);
        text-align: center;
      }
      .badge {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--accent);
        background: var(--accent-light);
        padding: 2px 8px;
        border-radius: 9999px;
        margin-bottom: 12px;
        border: 1px solid var(--accent-border);
      }
      .spinner {
        width: 36px;
        height: 36px;
        border: 3.5px solid var(--spinner-track);
        border-top-color: var(--accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 14px;
      }
      .title {
        color: var(--text-primary);
        font-weight: 700;
        font-size: 15px;
        margin: 0 0 4px 0;
      }
      .subtitle {
        color: var(--text-secondary);
        font-size: 11px;
        margin: 0 0 14px 0;
      }
      .branches {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: var(--bg-branches);
        padding: 10px 14px;
        border-radius: var(--branches-radius);
        border: 1px solid var(--border-branches);
        width: 100%;
        box-sizing: border-box;
      }
      .branch {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-source-branch);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
      }
      .branch.target {
        color: var(--accent);
      }
      .arrow {
        color: var(--text-arrow);
        font-size: 14px;
        flex-shrink: 0;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }
    `;

    const bg = document.createElement('div');
    bg.className = 'overlay-bg';

    bg.innerHTML = `
      <div class="card">
        <span class="badge">GitLab Automator</span>
        <div class="spinner"></div>
        <h3 class="title">Automating Target Branch</h3>
        <p class="subtitle">Redirecting to automated target branch...</p>
        <div class="branches">
          <span class="branch" title="${sourceBranch}">${sourceBranch}</span>
          <span class="arrow">→</span>
          <span class="branch target" title="${targetBranch}">${targetBranch}</span>
        </div>
      </div>
    `;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(bg);

    document.documentElement.appendChild(this.overlay);
  }

  hide() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
      this.shadowRoot = null;
    }
  }
}
