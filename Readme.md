# GitLab Automator

<div align="center">

> 🚀 **A modern, powerful Chrome Extension to streamline GitLab Merge Requests with intelligent branch automation, dynamic routing rules, live branch suggestions, quiet update notifications, and aesthetic UI personalization.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38b2ac.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## ✨ Features Overview

### 1. 🔀 Intelligent Branch Routing Automation
- **Target Branch Auto-Resolution**: When visiting GitLab's `/-/merge_requests/new` page, the extension automatically determines and routes the merge request to the correct target branch based on configurable rules:
  - **Default Rule 1**: Source `development` ➔ Target `main` (Release workflow)
  - **Default Rule 2**: Source `*` (any branch) ➔ Target `development` (Feature/Hotfix workflow)
- **Wildcard & Pattern Matching**: Supports exact branches (`development`, `main`), wildcard catch-alls (`*`), and prefix patterns (`feat/*`, `hotfix/*`, `fix/*`).
- **First-Match Precedence**: Rules are evaluated sequentially from top to bottom.
- **Global & Per-Project Rules**: Configure routing rules globally in Settings, or customize project-specific rules in Project Settings that override global behavior.
- **Delete Source Branch Sync**: Set source branch deletion behavior per rule (`Default / Inherit`, `Always`, or `Never`).
- **Session Protection**: Automatically respects manual branch switches made by the user within the current browser session.
- **Full-Page Loading Overlay**: When an automatic target branch redirect is required, displays an elegant full-page backdrop blur overlay with animated spinner and branch indicators (`source ➔ target`), preventing visual stutter while GitLab reloads.

---

### 2. 💡 Hybrid Branch Suggestions & Combobox Input
- **Type or Select**: Input fields for Source Branch and Target Branch allow you to either pick from intelligent suggestions or type any custom branch/glob pattern directly.
- **Mandatory Presets**: Suggestions prominently prioritize `* (Any branch)` and `feat/* (Feature)`, along with `hotfix/*`, `fix/*`, `development`, and `main`.
- **Live Repository Branches**: Automatically fetches live branches directly from your active GitLab repository and merges them into the suggestion dropdown.
- **1-Click Quick Chips**: Convenient quick-preset buttons (`Any (*)`, `feat/*`, `development`, `hotfix/*`) for rapid rule creation.
- **"How Branch Automation Works" Guidance Box**: Built-in, interactive guide displayed by default in the rules editor with an explicit dismissal button (`X`) and toggle icon.

---

### 3. 🛡️ Global Confirmation Modal System
- **Unified Confirmation System**: Replaces browser-native, blocking `window.confirm()` popups with a beautiful, themed, accessible modal dialog (`z-[100]`, backdrop blur, animated transitions, ESC key dismissal).
- **Promise-Based `useConfirmation()` Hook**: Clean async API used throughout the application:
  - **Reset Branch Rules**: Confirmation with a visual breakdown of the default rules before applying.
  - **Reset All Settings**: Danger-themed confirmation before clearing global configuration and project overrides.
  - **Delete Project Override**: Protection against accidental deletion of repository rules.
  - **Add to Exception List**: Warning modal before blacklisting a repository from auto-tracking.

---

### 4. 🗂️ Project Sorting & Activity Tracking
- **Last MR Created Tracking**: Automatically records a timestamp (`last_mr_created_at`) whenever you launch a Merge Request.
- **5-Way Project Sorting**: Sort your tracked projects effortlessly:
  - **MR Created**: Recently created MR first
  - **Name (A – Z)**: Alphabetical ascending
  - **Name (Z – A)**: Alphabetical descending
  - **Last Updated First**: Most recently edited project first
  - **Last Updated Last**: Oldest updated project first
- **Persistent Sort Memory**: Remembers your preferred sort order across sessions.

---

### 5. 🔔 Quiet GitHub Update Checker
- **Quiet Version Monitoring**: Silently checks the GitHub repository (`Shariar-Hasan/Gitlab-Automator`) for new releases without interrupting your workflow.
- **Top Alert Banner**: Displays a non-intrusive dismissible banner at the top of the popup when a newer version is released, featuring a 1-click link to the release notes.
- **Auto vs. Manual Control**: Configurable in Settings (Auto-check enabled by default, or manual-only check with real-time feedback).

---

### 6. 🔀 Smart Merge Request Creation Modal
- **Live Branch Search**: Real-time filtering through repository branches using GitLab's native API.
- **Visual Branch Flow**: Clear visual indicator showing `Source Branch ➔ Target Branch` before generating the MR.
- **Pre-filled Metadata**: Add optional MR Title and Description right from the extension popup.
- **One-Click Pre-populated Navigation**: Directly launches GitLab's `/merge_requests/new` page with all branch selections, title, description, and source branch deletion preference pre-configured.

---

### 7. 🎨 Aesthetic & Deep Personalization
- **Theme Modes**: Seamless **Light Mode** and **Dark Mode** support built with shadcn-inspired aesthetics.
- **Accent Color Customization**:
  - 8 curated presets: *GitLab Blue, Violet, Emerald, Rose, Amber, Cyan, Orange, Slate*.
  - **Custom Color Picker**: Choose any hex color to personalize buttons, highlights, switches, and gradients.
- **Corner Roundness Control**:
  - **Sharp (`none` / 0px)**: Modern, brutalist sharp-cornered look.
  - **Soft (`sm` / 4px)**: Clean, subtle rounding.
  - **Rounded (`md` / 12px)**: Default smooth, rounded container design.
- **Responsive Sizing**: Constrained to Chrome's 600px popup boundary with smooth `flex-1 min-h-0 overflow-y-auto` scrolling and pinned action footers.

---

### 8. ⚙️ Categorized Global Settings
Settings are cleanly organized into 5 distinct cards:
1. **Appearance & Theme**: Switch between light/dark mode, choose accent colors, and adjust corner roundness.
2. **Branch Automation**: Global branch routing rules editor and default source branch deletion toggle.
3. **Auto-Sync & Project Exceptions**: Toggle auto-tracking of visited GitLab repositories and manage blacklisted projects.
4. **GitLab Authentication**: Live status badge showing auto-captured session credentials (host, username, last sync time), plus optional Personal Access Token (PAT) input.
5. **Config & Backup**: Full JSON backup export, configuration import, update checker settings, and one-click reset to defaults.

---

## 📦 Installation & Setup

### Install from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shariar-Hasan/Gitlab-Automator.git
   cd Gitlab-Automator
   ```

2. **Install dependencies & Build**:
   ```bash
   npm install
   npm run build
   ```

3. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **"Developer mode"** in the top-right corner.
   - Click **"Load unpacked"**.
   - Select the `dist/` directory generated inside the project folder.
   - The GitLab Automator extension is now installed and active! 🎉

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Platform**: Chrome Extensions Manifest V3 (Content script bundled as standalone IIFE)

---

## 📁 Project Structure

```
Gitlab-Automator/
├── src/
│   ├── content/                       # Content scripts injected into GitLab pages
│   │   ├── authExtractor.ts           # Captures session auth & CSRF tokens
│   │   ├── branchAutomation.ts        # Routing resolution & branch matching
│   │   ├── GitLabAdapter.ts           # Interacts with GitLab DOM elements & query params
│   │   ├── overlay/
│   │   │   └── loadingOverlay.ts      # Full-page redirection loading animation
│   │   └── index.ts                   # Content script entry point & message listener
│   ├── popup/                         # Extension popup UI (React)
│   │   ├── components/                # Modular UI components
│   │   │   ├── BranchRulesEditor.tsx  # Dynamic branch routing rules editor
│   │   │   ├── BranchSuggestInput.tsx # Hybrid combobox input with branch suggestions
│   │   │   ├── ConfirmationModal.tsx  # Reusable confirmation modal dialog
│   │   │   ├── CreateMergeRequestModal.tsx # Branch search & MR creator
│   │   │   ├── CurrentProjectCard.tsx # Active repository accordion
│   │   │   ├── Header.tsx             # Top header with global toggle
│   │   │   ├── ProjectOverrideDialog.tsx # Add new project modal
│   │   │   ├── ProjectOverrides.tsx   # Projects list with sort & sliding actions
│   │   │   ├── ProjectSettingsDialog.tsx # Per-project settings modal
│   │   │   ├── Settings.tsx           # Categorized global settings cards
│   │   │   ├── Tabs.tsx               # Home / Settings tab switcher
│   │   │   └── UpdateBanner.tsx       # GitHub update alert banner
│   │   ├── context/
│   │   │   └── ConfirmationContext.tsx # Global promise-based confirmation provider
│   │   ├── App.tsx                    # Main React application component
│   │   ├── index.css                  # Global theme, scrollbars & dynamic radius CSS
│   │   └── main.tsx                   # React root mount
│   └── shared/                        # Shared utilities, storage & types
│       ├── services/
│       │   ├── branchService.ts       # GitLab branch search & caching service
│       │   └── updateService.ts       # GitHub release update checker service
│       ├── storage/                   # Chrome storage managers (config & auth)
│       ├── types/                     # TypeScript definitions & interfaces
│       └── utils/                     # Theme, logger & branch helper utilities
├── manifest.json                      # Manifest V3 extension configuration
├── vite.config.ts                     # Vite build setup for Chrome extension
└── package.json                       # Project dependencies and scripts
```

---

## 📝 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs Vite in development mode |
| `npm run build` | Compiles TypeScript and builds the production extension bundle into `dist/` |
| `npm run preview` | Previews the production build locally |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/Shariar-Hasan/Gitlab-Automator/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">

**Made with ❤️ for developers using GitLab**

⭐ Star this repository if it helps streamline your daily workflow!

</div>
