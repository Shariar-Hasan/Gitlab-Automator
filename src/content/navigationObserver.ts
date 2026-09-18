export class NavigationObserver {
  private onNavigate: () => void;
  private observer: MutationObserver | null = null;
  private lastUrl = location.href;

  constructor(onNavigate: () => void) {
    this.onNavigate = onNavigate;
  }

  start() {
    // Intercept pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
      window.dispatchEvent(new Event('locationchange'));
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('replacestate'));
      window.dispatchEvent(new Event('locationchange'));
    };

    window.addEventListener('popstate', () => {
      window.dispatchEvent(new Event('locationchange'));
    });

    window.addEventListener('locationchange', () => {
      if (this.lastUrl !== location.href) {
        this.lastUrl = location.href;
        this.checkNavigation();
      }
    });

    // Also use MutationObserver for Turbo/PJAX body changes
    this.observer = new MutationObserver(() => {
      if (this.lastUrl !== location.href) {
        this.lastUrl = location.href;
        this.checkNavigation();
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial check
    this.checkNavigation();
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private checkNavigation() {
    // Small delay to let DOM settle after navigation
    setTimeout(() => {
      this.onNavigate();
    }, 100);
  }
}
