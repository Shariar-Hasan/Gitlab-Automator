Build a production-quality Chrome Extension called **GitLab Merge Request Automator** using:

* React
* TypeScript
* Vite
* Chrome Extension Manifest V3
* Chrome Storage API
* No backend
* No authentication/login
* No external database
* No unnecessary permissions

The extension is designed for developers who use GitLab and want to automatically change the target branch when creating a Merge Request.

---

# 1. Core Problem

In our GitLab workflow, developers create feature branches and Merge Requests.

GitLab normally defaults the Merge Request target branch to `main`.

Our workflow requires feature branches to be merged into `development` first.

Therefore, whenever the user starts creating a Merge Request, the extension should automatically change the target branch from the default branch (`main`) to the configured development/integration branch.

Example:

Feature branch:

`feature/add-payment`

Instead of:

`feature/add-payment → main`

Automatically configure:

`feature/add-payment → development`

The user should not need to manually change the target branch.

---

# 2. Main Automation Behavior

The extension should run on GitLab pages where Merge Requests are being created.

When the user clicks:

**Create merge request**

or enters the Merge Request creation page, detect the current source and target branches.

If:

* Source branch != configured target branch
* Target branch is missing OR target branch is GitLab's default branch (`main`)
* Automatic branch switching is enabled

then automatically switch the target branch to the configured branch.

The default configured branch should be:

`development`

But this must be configurable.

---

# 3. Important Existing Behavior

I previously implemented this functionality using a small userscript.

The old implementation works approximately like this:

```js
const url = new URL(location.href);
const params = url.searchParams;

const isTargetBranchDevelopment =
  params.get("merge_request[target_branch]") === "development";

const isSourceBranchDevelopment =
  params.get("merge_request[source_branch]") === "development";

const isTargetBranchNotExist =
  !params.get("merge_request[target_branch]");

if (isTargetBranchNotExist && !isSourceBranchDevelopment) {
  params.set(
    "merge_request[target_branch]",
    "development"
  );

  location.href =
    `${url.origin}${url.pathname}?${params.toString()}`;

  return;
}
```

The extension should improve this approach rather than blindly copying it.

Use a combination of:

* URL detection
* DOM detection
* MutationObserver
* GitLab page navigation detection
* SPA navigation handling

Do NOT rely only on a polling `setInterval`.

---

# 4. Automatic Branch Switching

When automatic switching happens:

1. Detect Merge Request creation page.
2. Detect source branch.
3. Detect current target branch.
4. Resolve the correct configured target branch.
5. Show a polished loading overlay.
6. Change the target branch.
7. Reload/update the page only when necessary.
8. Hide the loader after successful transition.

The loading UI should communicate:

> Switching target branch

Then:

> Target branch changed to `development`

The animation should feel fast and unobtrusive.

Do not block the user unnecessarily.

---

# 5. Never Override Intentional User Selection

This is extremely important.

The extension should NOT continuously force the target branch.

For example:

User manually selects:

`staging`

The extension must not immediately change it back to:

`development`

Automation should mainly happen when the Merge Request page is initially opened or when GitLab initializes its default target branch.

After the user intentionally changes the branch, respect the user's choice.

Avoid creating an infinite reload loop.

---

# 6. Special Cases

Handle these cases correctly.

### Case A

Source:

`feature/foo`

Target:

`main`

Configured branch:

`development`

Result:

Automatically change to:

`development`

---

### Case B

Source:

`feature/foo`

Target:

`development`

Result:

Do nothing.

---

### Case C

Source:

`development`

Target:

`main`

Result:

Do not automatically change target branch.

A development → main Merge Request may be intentional.

---

### Case D

Source:

`feature/foo`

Target:

`staging`

Result:

Do not override the user's explicit selection.

---

### Case E

Configured project branch:

`release`

Current target:

`main`

Result:

Automatically switch to:

`release`

---

### Case F

Automation disabled globally.

Result:

Do nothing.

---

### Case G

Automation enabled globally but disabled for a specific project.

Result:

Do nothing for that project.

---

# 7. Configuration System

Build a configuration system using Chrome Storage.

Use:

```ts
chrome.storage.sync
```

where appropriate.

The configuration should support:

## Global configuration

Example:

```ts
interface GlobalConfig {
  enabled: boolean;
  defaultTargetBranch: string;
}
```

Default:

```ts
{
  enabled: true,
  defaultTargetBranch: "development"
}
```

---

# 8. Project-Specific Configuration

Users should be able to override the global branch for specific GitLab projects.

Example:

```ts
interface ProjectConfig {
  projectKey: string;
  projectName?: string;
  targetBranch: string;
  enabled: boolean;
}
```

Example storage:

```ts
{
  projects: {
    "gitlab.example.com/group/project-a": {
      targetBranch: "development",
      enabled: true
    },

    "gitlab.example.com/group/project-b": {
      targetBranch: "staging",
      enabled: true
    }
  }
}
```

The project identifier must be stable.

Prefer GitLab project URL/path rather than relying on DOM text alone.

Example:

```text
gitlab.example.com/company/backend
```

---

# 9. Configuration Resolution

When deciding which target branch to use:

```text
Project-specific configuration
        ↓
Global default configuration
        ↓
development
```

Meaning:

1. If current GitLab project has a configuration → use it.
2. Otherwise use global default branch.
3. If configuration is invalid → safely fall back.

---

# 10. Chrome Extension Popup

Create a beautiful React-based popup.

The popup should feel like a polished developer tool.

Suggested dimensions:

Approximately:

```text
400px × 600px
```

but make it responsive.

Use:

* Clean typography
* Cards
* Toggles
* Select/dropdown controls
* Icons
* Subtle animations
* Clear hierarchy
* Good spacing
* Accessible controls

Avoid making it look like a generic browser extension from 2015.

---

# 11. Popup Layout

Design the popup approximately like this:

## Header

GitLab Merge Request Automator

Small status indicator:

🟢 Automation Active

or

⚪ Automation Disabled

Include a global enable/disable toggle.

---

## Default Branch Card

Title:

`Default Target Branch`

Description:

`Used when a project doesn't have its own configuration.`

Input:

```text
development
```

Example:

```text
Default Target Branch
┌─────────────────────────────┐
│ development                 │
└─────────────────────────────┘

Changes are automatically saved.
```

---

# 12. Current Project Section

When the user is currently on a GitLab project, detect it.

Show:

```text
Current Project

company/backend
```

Then show:

```text
Target Branch

development
```

with an option:

`Use custom branch`

When enabled:

```text
Target Branch
[ staging              ]
```

And:

`Enable automation for this project`

---

# 13. Project Configuration Management

Add a section:

`Project Overrides`

Display configured projects as cards/list items.

Example:

```text
Project Overrides

┌────────────────────────────────────┐
│ company/backend                    │
│ Target: development                │
│                           [ON]     │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ company/frontend                   │
│ Target: staging                    │
│                           [ON]     │
└────────────────────────────────────┘
```

Each project should support:

* Enable/disable
* Change target branch
* Delete override

Add:

`+ Add Project Override`

---

# 14. Add Project Override

Create a modal/dialog.

Fields:

```text
GitLab Project

Project URL / Path
[ company/my-project ]

Target Branch
[ development ]

Enable automation
[ ON ]
```

Buttons:

`Cancel`

`Save`

Validate input.

Prevent duplicate project configurations.

---

# 15. Current Project Detection

On GitLab pages, detect the project from the current URL.

Support common GitLab URL formats.

For example:

```text
https://gitlab.com/group/project/-/merge_requests/new
```

Project key should resolve to something stable such as:

```text
gitlab.com/group/project
```

Handle nested groups:

```text
gitlab.com/company/team/backend
```

Do not simply assume that the project is always the first two URL segments.

Use the GitLab URL structure and Merge Request route to determine the project root.

---

# 16. GitLab Host Support

Do NOT hardcode only:

```text
gitlab.com
```

The extension should work with self-hosted GitLab instances.

Examples:

```text
gitlab.com
gitlab.company.com
gitlab.example.local
```

The extension should run on GitLab domains/pages rather than requiring a fixed domain.

However, keep host permissions as minimal as possible.

---

# 17. GitLab UI Detection

GitLab's UI can change.

Avoid fragile selectors wherever possible.

Create a small abstraction layer:

```ts
GitLabAdapter
```

with methods such as:

```ts
getSourceBranch()
getTargetBranch()
setTargetBranch(branch)
isMergeRequestCreationPage()
getProjectKey()
```

Keep GitLab DOM-specific logic isolated from the rest of the application.

This will make future GitLab UI changes easier to maintain.

---

# 18. URL-Based Branch Switching

If GitLab's Merge Request creation page supports URL query parameters such as:

```text
merge_request[target_branch]
merge_request[source_branch]
```

prefer using the URL mechanism when it is reliable.

Example:

```ts
const url = new URL(window.location.href);

url.searchParams.set(
  "merge_request[target_branch]",
  targetBranch
);
```

Then navigate appropriately.

However, do not blindly reload the page every time.

First determine whether the current target branch already matches the desired branch.

---

# 19. MutationObserver

Use `MutationObserver` for GitLab dynamic UI changes.

GitLab may use Turbo/PJAX/SPA-like navigation and dynamically render parts of the page.

The content script should detect:

* Initial page load
* Navigation without full reload
* Merge Request form appearing
* Branch selector appearing

Avoid aggressive DOM polling.

If a fallback polling mechanism is absolutely necessary, make it:

* short-lived
* throttled
* cleaned up properly

---

# 20. Navigation Detection

Support:

```ts
pushState
replaceState
popstate
```

and relevant GitLab navigation behavior.

Create a navigation observer/service so the extension can re-run detection when the user navigates from:

```text
/project
```

to:

```text
/project/-/merge_requests/new
```

without refreshing the page.

---

# 21. Loading Overlay

Create a React-independent lightweight DOM overlay for the content script, OR create a reusable UI component that can be mounted into a Shadow DOM.

Prefer Shadow DOM for injected UI to prevent GitLab CSS from breaking the extension UI.

Example UI:

```text
┌─────────────────────────────────────┐
│                                     │
│              ◌                      │
│                                     │
│     Switching target branch         │
│                                     │
│     feature/foo → development      │
│                                     │
│     Please wait...                  │
│                                     │
└─────────────────────────────────────┘
```

Use smooth animations.

Do not freeze the entire browser.

Make the overlay disappear automatically after the operation.

---

# 22. Success Feedback

After successful branch switching, optionally show a small toast:

```text
✓ Target branch changed to development
```

It should automatically disappear.

Use the same design system as the popup.

---

# 23. Failure Handling

If automatic branch switching fails:

Do not leave the page stuck behind a loading overlay.

Show:

```text
Unable to switch target branch automatically.

Current target:
main

Expected target:
development
```

Actions:

```text
Retry
```

and

```text
Continue manually
```

The extension must fail gracefully.

---

# 24. Debug Mode

Add a developer/debug option in settings.

Example:

```text
Developer Options

[ ] Enable debug logging
```

When enabled:

```text
[GitLab Automator]
Detected MR creation page

[GitLab Automator]
Source branch: feature/payment

[GitLab Automator]
Current target: main

[GitLab Automator]
Resolved target: development

[GitLab Automator]
Switching target branch...
```

Use a centralized logger.

Do not log sensitive information.

---

# 25. Storage Architecture

Create a dedicated storage service.

Example:

```ts
storage/
  configStorage.ts
  storageTypes.ts
```

API:

```ts
getConfig()
updateGlobalConfig()
getProjectConfig(projectKey)
setProjectConfig(projectKey, config)
removeProjectConfig(projectKey)
```

All Chrome Storage access should go through this layer.

Do not scatter:

```ts
chrome.storage.sync.get(...)
```

throughout React components.

---

# 26. State Management

Do NOT introduce Redux unless genuinely necessary.

Use:

* React state
* Context if appropriate
* Custom hooks

Example:

```ts
useExtensionConfig()
useProjectConfig()
useCurrentGitLabProject()
```

Keep the architecture simple.

---

# 27. Suggested Project Structure

Use a clean structure similar to:

```text
src/
├── background/
│   └── index.ts
│
├── content/
│   ├── index.ts
│   ├── GitLabAdapter.ts
│   ├── navigationObserver.ts
│   ├── branchAutomation.ts
│   ├── overlay/
│   │   └── loadingOverlay.ts
│   └── utils/
│
├── popup/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── AutomationToggle.tsx
│   │   ├── DefaultBranchCard.tsx
│   │   ├── CurrentProjectCard.tsx
│   │   ├── ProjectOverrides.tsx
│   │   └── ProjectOverrideDialog.tsx
│   └── hooks/
│
├── shared/
│   ├── types/
│   ├── constants/
│   ├── storage/
│   ├── utils/
│   └── logger/
│
└── manifest.ts
```

Adjust the structure if the chosen Vite extension architecture requires a better organization.

---

# 28. Manifest V3

Use Manifest V3.

Keep permissions minimal.

Likely:

```json
{
  "manifest_version": 3,
  "permissions": [
    "storage"
  ]
}
```

Use content scripts for GitLab page automation.

Avoid requesting:

```text
tabs
cookies
webRequest
identity
```

unless there is a real technical reason.

No authentication should be required.

---

# 29. No Login

The extension must NOT require:

* GitLab login inside the extension
* OAuth
* Personal Access Token
* Backend account
* Email
* Password

The user is already logged into GitLab in their browser.

The extension simply modifies the GitLab page/UI.

---

# 30. Privacy

Because this is a local browser extension:

* Do not send project names to external servers.
* Do not send branch names to external servers.
* Do not collect analytics.
* Do not track users.
* Do not use remote APIs.
* Store configuration locally using Chrome Storage.

Add a small Privacy section in settings:

```text
Privacy

Your configuration is stored in Chrome Storage.
This extension does not send your GitLab project or branch information
to any external server.
```

---

# 31. Import / Export Settings

Add a useful advanced feature:

```text
Settings

Export Configuration
Import Configuration
Reset Configuration
```

Export as JSON.

Example:

```json
{
  "version": 1,
  "global": {
    "enabled": true,
    "defaultTargetBranch": "development"
  },
  "projects": {}
}
```

Validate imported configuration before saving.

Do not allow malformed JSON to break the extension.

---

# 32. Reset Configuration

Add:

`Reset All Settings`

Require confirmation:

```text
Reset all settings?

This will remove your global configuration and all project overrides.

Cancel
Reset
```

---

# 33. UX Details

The extension should feel like a real developer productivity tool.

Include:

* Empty states
* Helpful descriptions
* Inline validation
* Toast notifications
* Loading states
* Confirmation dialogs
* Keyboard accessibility
* Proper focus handling
* Tooltips where useful
* Responsive popup layout

Do not overload the interface.

Prioritize:

1. Enable/disable automation
2. Default target branch
3. Current project
4. Project-specific override
5. Advanced settings

---

# 34. Visual Design

Use a modern developer-tool aesthetic.

Suggested design language:

* GitLab-inspired but NOT a copy
* Neutral background
* Clear cards
* Rounded corners
* Subtle borders
* Small shadows
* Compact spacing
* Professional typography
* Clear status indicators
* Smooth 150–250ms transitions

Use icons where useful.

Do not make the popup unnecessarily colorful.

---

# 35. Popup UX Example

Conceptually:

```text
┌──────────────────────────────────────┐
│ GitLab Automator              ● ON   │
│ Automatically manage MR targets      │
├──────────────────────────────────────┤
│                                      │
│ DEFAULT TARGET                       │
│ ┌──────────────────────────────────┐ │
│ │ development                  ▼   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Used when no project override exists │
│                                      │
├──────────────────────────────────────┤
│ CURRENT PROJECT                      │
│                                      │
│ ● company/backend                   │
│                                      │
│ Target branch                       │
│ development                         │
│                                      │
│ [ Configure project ]                │
│                                      │
├──────────────────────────────────────┤
│ PROJECT OVERRIDES                    │
│                                      │
│ company/frontend                     │
│ staging                    ● ON      │
│                                      │
│ company/mobile                       │
│ development                ● ON      │
│                                      │
│ + Add project override               │
│                                      │
├──────────────────────────────────────┤
│ Settings                             │
│ Import • Export • Reset              │
└──────────────────────────────────────┘
```

---

# 36. Important Automation Safety Rules

Implement these rules carefully:

### Rule 1

Never modify target branch if automation is disabled.

### Rule 2

Never modify target branch if source branch equals target branch.

### Rule 3

Never modify target branch after the user has intentionally selected a different target branch.

### Rule 4

Never repeatedly reload the page.

### Rule 5

Prevent automation loops.

Use session/page state if necessary.

Example:

```ts
sessionStorage.setItem(
  "gitlab-automator-switching",
  "true"
);
```

or another robust mechanism.

### Rule 6

If branch switching fails, restore the UI and allow manual interaction.

### Rule 7

Do not interfere with Merge Requests that are clearly intentional:

```text
development → main
release → main
hotfix → main
```

unless the configuration explicitly requires otherwise.

---

# 37. Testing

Create tests for the branch resolution logic.

Test cases:

```text
global default = development

project override = staging

source = feature/foo
target = main
=> development

source = feature/foo
target = main
project override = staging
=> staging

source = feature/foo
target = development
=> no change

source = feature/foo
target = staging
=> no change

source = development
target = main
=> no automatic change

automation disabled
=> no change

project override disabled
=> use global behavior or project-specific disabled behavior according to configuration
```

Also test:

* Nested GitLab groups
* Self-hosted GitLab
* Missing branch parameters
* Slow DOM rendering
* SPA navigation
* Page refresh
* Duplicate observers
* Duplicate overlays
* Multiple Merge Request page navigations
* Invalid storage data
* Import/export
* Extension reload

---

# 38. Type Safety

Use strict TypeScript.

Avoid:

```ts
any
```

unless absolutely necessary for third-party/browser API edge cases.

Create explicit types for:

* GlobalConfig
* ProjectConfig
* ExtensionConfig
* GitLabProject
* BranchState
* AutomationResult

---

# 39. Code Quality

The final implementation should be:

* Modular
* Maintainable
* Type-safe
* Testable
* Easy to extend
* Easy to debug

Do not put everything inside:

```text
content.ts
```

Do not create giant React components.

Do not mix:

* DOM manipulation
* Chrome Storage
* configuration resolution
* UI
* GitLab detection

inside the same file.

Separate responsibilities.

---

# 40. README

Create a high-quality README containing:

## GitLab Merge Request Automator

### Features

* Automatic target branch selection
* Global default branch
* Project-specific overrides
* Self-hosted GitLab support
* Chrome Storage
* No login
* No backend
* Privacy-focused

### Installation

Explain how to:

```bash
npm install
npm run build
```

Then:

```text
Chrome
→ Extensions
→ Developer Mode
→ Load unpacked
→ Select dist/
```

### Usage

Explain:

1. Install extension
2. Open GitLab
3. Open Merge Request creation page
4. Extension automatically selects configured target branch
5. Open popup to customize global/project settings

---

# 41. Build Configuration

Configure Vite correctly for a Chrome MV3 extension.

The final project should build successfully with:

```bash
npm run build
```

and produce a usable:

```text
dist/
```

directory.

Ensure:

* manifest is generated correctly
* content script is included
* popup is included
* assets resolve correctly
* no broken imports
* no absolute development URLs
* production build works

---

# 42. Development Experience

Add scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

Use sensible linting/formatting if appropriate.

---

# 43. Final Deliverable

Generate the complete working project.

Do NOT only provide snippets.

Create:

* package.json
* Vite configuration
* TypeScript configuration
* Manifest V3
* React popup
* Content script
* GitLab adapter
* Storage layer
* Configuration resolver
* MutationObserver/navigation handling
* Loading overlay
* Toast/success UI
* Error handling
* Import/export
* Reset settings
* Tests
* README

The result should be immediately runnable after:

```bash
npm install
npm run build
```

Then it should be loadable as an unpacked Chrome extension.

---

# 44. Important Implementation Philosophy

Do not over-engineer this.

The core functionality is simple:

```text
GitLab MR page
      ↓
Detect project
      ↓
Read configuration
      ↓
Resolve target branch
      ↓
Detect current target
      ↓
Is automatic change required?
      ↓
      YES
      ↓
Show loader
      ↓
Switch target branch
      ↓
Show success
```

The configuration UI should be polished, but the automation itself should remain lightweight and reliable.

Most importantly:

**The extension should stay out of the user's way.**

If everything is configured correctly, the user should simply click:

`Create merge request`

and see:

```text
Switching target branch...
```

then GitLab should open with:

```text
Target branch: development
```

without requiring any manual action.
