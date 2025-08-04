(function () {
    // Redirect to development if no target_branch in URL
    const url = new URL(location.href);
    const params = url.searchParams;
    if (!params.get("merge_request[target_branch]")) {
        params.set("merge_request[target_branch]", "development");
        location.href = `${url.origin}${url.pathname}?${params.toString()}`;
        return;
    }

    const interval = setInterval(() => {
        // Uncheck delete source branch checkbox
        const checkbox = document.querySelector("#merge_request_force_remove_source_branch");
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
        }

        // Add "Change to main" link after target branch title
        const targetTitle = document.querySelector("#js-target-branch-title");
        if (targetTitle && !document.querySelector("#change-to-main-link")) {
            const a = document.createElement("a");
            a.textContent = "Change to main";
            a.href = "#";
            a.style.marginLeft = "8px";
            a.style.fontSize = "16px";
            a.className = "btn btn-md btn-confirm"
            a.id = "change-to-main-link";
            a.style.backgroundColor = "#fafc6dff";
            a.style.color = "#000000ff";

            a.onclick = (e) => {
                e.preventDefault();
                const newParams = new URLSearchParams(location.search);
                newParams.set("merge_request[target_branch]", "main");
                location.href = `${location.origin}${location.pathname}?${newParams.toString()}`;
            };

            targetTitle.insertAdjacentElement("afterend", a);
        }
    }, 300);

    // Stop after 5 seconds
    setTimeout(() => clearInterval(interval), 5000);
})();
