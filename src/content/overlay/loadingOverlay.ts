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
      width: 100%;
      height: 100%;
      z-index: 2147483647; /* Max z-index */
      pointer-events: auto;
    `;

    this.shadowRoot = this.overlay.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      .overlay-bg {
        position: absolute;
        inset: 0;
        background-color: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 320px;
        width: 100%;
        border: 1px solid #e2e8f0;
      }
      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e2e8f0;
        border-top-color: #2563eb;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }
      .title {
        color: #0f172a;
        font-weight: 600;
        font-size: 16px;
        margin: 0 0 12px 0;
      }
      .branches {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f8fafc;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        width: 100%;
        box-sizing: border-box;
      }
      .branch {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
        color: #334155;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100px;
      }
      .arrow {
        color: #94a3b8;
        font-size: 14px;
        flex-shrink: 0;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;

    const bg = document.createElement('div');
    bg.className = 'overlay-bg';

    bg.innerHTML = `
      <div class="card">
        <div class="spinner"></div>
        <h3 class="title">Switching Target Branch</h3>
        <div class="branches">
          <span class="branch" title="${sourceBranch}">${sourceBranch}</span>
          <span class="arrow">→</span>
          <span class="branch" title="${targetBranch}">${targetBranch}</span>
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
