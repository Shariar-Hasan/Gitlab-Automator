(function () {
    const waitFor = (selector, timeout = 2000) =>
        new Promise((resolve, reject) => {
            const interval = 100;
            let elapsed = 0;
            const check = () => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                elapsed += interval;
                if (elapsed >= timeout) return reject("Timeout waiting for selector: " + selector);
                setTimeout(check, interval);
            };
            check();
        });

    async function enhanceGitLabMRPage() {
        try {
            const form = await waitFor('form#new_merge_request');
            const targetBranchSelect = await waitFor('[name="merge_request[target_branch]"]');
            const deleteCheckbox = await waitFor('#merge_request_force_remove_source_branch');

            // Create new button
            const mrWithDevelopment = createButton("Create MR with Development", () => {
                // Check if the form is valid before proceeding
                if (!form.checkValidity()) {
                    alert("Please fill out all required fields before creating the MR.");
                    return;
                }
                if (targetBranchSelect) {
                    targetBranchSelect.value = "development";
                }
                if (deleteCheckbox) {
                    deleteCheckbox.checked = false;
                }
                form.submit();
            }, { bgColor: "#4CAF50", textColor: "white" });
            const mrWithDevelopmentAndDeleteSource = createButton("Create MR with Development and Delete Source", () => {
                // Check if the form is valid before proceeding
                if (!form.checkValidity()) {
                    alert("Please fill out all required fields before creating the MR.");
                    return;
                }
                if (targetBranchSelect) {
                    targetBranchSelect.value = "development";
                }
                if (deleteCheckbox) {
                    deleteCheckbox.checked = true;
                }
                form.submit();
            }, { bgColor: "#f44336", textColor: "white" });

            // Insert the button beside the default one
            const createBtn = document.querySelector('[data-track-label="submit_mr"]');
            if (createBtn && createBtn.parentNode) {
                createBtn.parentNode.insertBefore(mrWithDevelopmentAndDeleteSource, createBtn.nextSibling);
                createBtn.parentNode.insertBefore(mrWithDevelopment, createBtn.nextSibling);
            }
        } catch (err) {
            console.error("GitLab MR Enhancer Error:", err);
        }
    }
    function createButton(text, onClick, { bgColor, textColor }) {
        const newBtn = document.createElement("button");
        newBtn.textContent = text;
        newBtn.type = "button";
        newBtn.style.margin = "0px 8px";
        newBtn.style.backgroundColor = bgColor || "#4CAF50";
        newBtn.style.color = textColor || "white";
        newBtn.className = "btn btn-confirm";
        newBtn.onclick = onClick;
        return newBtn;
    }

    enhanceGitLabMRPage();
})();
