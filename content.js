(function () {
  function showLoadingOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "branch-loading-overlay";
    overlay.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.7);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 9999;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          `;

    const loadingContent = document.createElement("div");
    loadingContent.style.cssText = `
              text-align: center;
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          `;

    const spinner = document.createElement("div");
    spinner.style.cssText = `
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #1f75cb;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 16px;
          `;

    const text = document.createElement("div");
    text.textContent = "Switching target branch to Development...";
    text.style.cssText = `
              font-size: 16px;
              color: #333;
              font-weight: 500;
          `;

    // Add CSS animation for spinner
    const style = document.createElement("style");
    style.textContent = `
              @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }
          `;
    document.head.appendChild(style);

    loadingContent.appendChild(spinner);
    loadingContent.appendChild(text);
    overlay.appendChild(loadingContent);
    document.body.appendChild(overlay);

    return overlay;
  }

  // Redirect to development if no target_branch in URL
  const url = new URL(location.href);
  const params = url.searchParams;
  const isTargetBranchDevelopment =
    params.get("merge_request[target_branch]") === "development";
  const isSourceBranchDevelopment =
    params.get("merge_request[source_branch]") === "development";
  const isTargetBranchNotExist = !params.get("merge_request[target_branch]");
  if (isTargetBranchNotExist) {
    params.set("merge_request[target_branch]", "development");
    showLoadingOverlay();
    location.href = `${url.origin}${url.pathname}?${params.toString()}`;
    return;
  }

  const interval = setInterval(() => {
    // Uncheck delete source branch checkbox
    const checkbox = document.querySelector(
      "#merge_request_force_remove_source_branch"
    );
    if (checkbox && checkbox.checked) {
      checkbox.checked = false;
    }

    // Add "Change to main" link after target branch title
    const targetTitle = document.querySelector("#js-target-branch-title");
    if (
      targetTitle &&
      !document.querySelector("#change-to-main-link") &&
      !isSourceBranchDevelopment
    ) {
      const a = document.createElement("a");
      a.textContent = isTargetBranchDevelopment
        ? "Change to main"
        : "Change to development";
      a.href = "#";
      a.style.marginLeft = "8px";
      a.style.fontSize = "14px";
      a.style.fontWeight = "400";
      a.className = "gl-button btn btn-md btn-confirm";
      a.id = "change-to-main-link";

      a.onclick = (e) => {
        e.preventDefault();
        showLoadingOverlay();
        const newParams = new URLSearchParams(location.search);
        newParams.set(
          "merge_request[target_branch]",
          isTargetBranchDevelopment ? "main" : "development"
        );
        location.href = `${location.origin}${
          location.pathname
        }?${newParams.toString()}`;
      };

      targetTitle.insertAdjacentElement("afterend", a);
    }
  }, 300);

  // Stop after 5 seconds
  setTimeout(() => clearInterval(interval), 5000);
})();
