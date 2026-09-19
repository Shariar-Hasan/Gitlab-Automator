export class LoadingOverlay {
  private overlay: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;

  show(sourceBranch: string, targetBranch: string) {
    if (this.overlay) return;

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
      .overlay-bg {
        position: fixed;
        inset: 0;
        background-color: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        animation: fadeIn 0.15s ease-out;
      }
      .card {
        background: #ffffff;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 360px;
        width: 90%;
        border: 1px solid #e2e8f0;
        text-align: center;
      }
      .badge {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #2563eb;
        background: #eff6ff;
        padding: 2px 8px;
        border-radius: 9999px;
        margin-bottom: 12px;
        border: 1px solid #dbeafe;
      }
      .spinner {
        width: 36px;
        height: 36px;
        border: 3.5px solid #e2e8f0;
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 14px;
      }
      .title {
        color: #0f172a;
        font-weight: 700;
        font-size: 15px;
        margin: 0 0 4px 0;
      }
      .subtitle {
        color: #64748b;
        font-size: 11px;
        margin: 0 0 14px 0;
      }
      .branches {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: #f8fafc;
        padding: 10px 14px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        width: 100%;
        box-sizing: border-box;
      }
      .branch {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
        font-weight: 600;
        color: #1e293b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 120px;
      }
      .branch.target {
        color: #2563eb;
      }
      .arrow {
        color: #94a3b8;
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
