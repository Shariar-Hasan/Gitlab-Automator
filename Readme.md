# GitLab Automator

<div align="center">

> 🚀 **A modern, powerful Chrome Extension to streamline GitLab Merge Requests with intelligent branch selection, live search, per-project overrides, and aesthetic UI personalization.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38b2ac.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## ✨ Features Overview

### 1. 🔀 Smart Merge Request Creation Modal
- **Live Branch Search**: Quickly search and filter through repository branches in real-time powered by GitLab's native `refs?search=` endpoint.
- **Searchable Source & Target Branches**: Both Source and Target branches feature searchable dropdowns with keyboard navigation and instant autocomplete.
- **Visual Branch Flow**: Clear visual indicator showing `Source Branch ➔ Target Branch` before generating the MR.
- **Pre-filled Metadata**: Add optional MR Title and Description right from the extension popup.
- **One-Click Pre-populated Navigation**: Directly launches GitLab's `/merge_requests/new` page with all branch selections, title, description, and source branch deletion preference pre-configured.

---

### 2. 📂 Project Management & Active Tracking
- **Active Project Accordion**: Automatically detects when you are browsing a GitLab project and tracks it in the popup.
- **Project Overrides**: Configure per-project rules:
  - Custom display name / alias
  - Project color badge (choose from curated presets or any custom color via HTML5 color picker)
  - Target branch override (e.g. `development`, `staging`, `main`)
  - "Delete source branch" preference override
- **Sliding Action Buttons**: Modern hover interactions — action buttons (Create MR, Settings, More) slide in smoothly on project rows.
- **Floating Context Menu**: Fixed-position three-dot popover to enable/disable or remove projects without UI clipping.
- **Add to Exception (Blacklist)**: Easily exclude projects from auto-tracking with a single click and confirmation warning.

---

### 3. 🎨 Aesthetic & Deep Personalization
- **Theme Modes**: Seamless **Light Mode** and **Dark Mode** support built with shadcn-inspired aesthetics.
- **Accent Color Customization**:
  - 8 curated presets: *GitLab Blue, Violet, Emerald, Rose, Amber, Cyan, Orange, Slate*.
  - **Custom Color Picker**: Choose any hex color to personalize buttons, highlights, switches, and gradients.
- **Corner Roundness Control**:
  - **Sharp (`none` / 0px)**: Modern, brutalist sharp-cornered look.
  - **Soft (`sm` / 4px)**: Clean, subtle rounding.
  - **Rounded (`md` / 12px)**: Default smooth, rounded container design.
- **Thin Scrollbars**: Universal 4px custom scrollbars designed for both light and dark backgrounds.

---

### 4. ⚙️ Categorized Global Settings
Settings are cleanly organized into 5 distinct cards:
1. **Appearance & Theme**: Switch between light/dark mode, choose accent colors, and adjust corner roundness.
2. **Branch Automation**: Set global default target branch (e.g., `development`) and toggle automatic deletion of source branches.
3. **Auto-Sync & Project Exceptions**: Toggle auto-tracking of visited GitLab repositories and manage blacklisted projects.
4. **GitLab Authentication**: Live status badge showing auto-captured session credentials (host, username, last sync time), plus optional Personal Access Token (PAT) input.
5. **Config & Backup**: Full JSON backup export, configuration import, and one-click reset to defaults.

---

### 5. 🤖 Content Script & In-Page Automation
- **Automatic Target Branch Redirection**: Visiting a new merge request page automatically sets your preferred target branch if none was specified.
- **Source Branch Safety**: Automatically sets the "Delete source branch" checkbox according to your global or project-specific preference.
- **Auto-Auth Extractor**: Transparently captures session tokens (CSRF, cookies, localStorage) upon visiting GitLab pages so API branch search works immediately.

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
- **Platform**: Chrome Extensions Manifest V3

---

## 📁 Project Structure

```
Gitlab-Automator/
├── src/
│   ├── content/                # Content scripts injected into GitLab pages
│   │   ├── authExtractor.ts    # Captures session auth & CSRF tokens
│   │   ├── branchAutomation.ts # Manages branch redirects & checkbox states
│   │   ├── GitLabAdapter.ts    # Interacts with GitLab DOM elements
│   │   └── index.ts            # Content script entry point & message listener
│   ├── popup/                  # Extension popup UI (React)
│   │   ├── components/         # Modular UI components
│   │   │   ├── CreateMergeRequestModal.tsx  # Branch search & MR creator
│   │   │   ├── CurrentProjectCard.tsx       # Active repository accordion
│   │   │   ├── Header.tsx                   # Top header with global toggle
│   │   │   ├── ProjectOverrideDialog.tsx    # Add new project modal
│   │   │   ├── ProjectOverrides.tsx         # Projects list with hover actions
│   │   │   ├── ProjectSettingsDialog.tsx    # Per-project settings modal
│   │   │   ├── Settings.tsx                 # Categorized global settings cards
│   │   │   └── Tabs.tsx                     # Home / Settings tab switcher
│   │   ├── App.tsx             # Main React application component
│   │   ├── index.css           # Global theme, scrollbars & dynamic radius CSS
│   │   └── main.tsx            # React root mount
│   └── shared/                 # Shared utilities, storage & types
│       ├── services/           # GitLab branch search service
│       ├── storage/            # Chrome storage managers (config & auth)
│       ├── types/              # TypeScript definitions & interfaces
│       └── utils/              # Theme & branch helper utilities
├── manifest.json               # Manifest V3 extension configuration
├── vite.config.ts              # Vite build setup for Chrome extension
└── package.json                # Project dependencies and scripts
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
