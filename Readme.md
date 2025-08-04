# GitLab Automator

> 🚀 A Chrome extension that automatically optimizes GitLab merge request creation by setting intelligent defaults and providing quick branch switching capabilities.

## ✨ Features

- 🎯 **Auto-Development Targeting**: Automatically redirects to set `development` as the default target branch
- � **Source Branch Protection**: Automatically prevents source branch deletion by unchecking the delete option
- 🔄 **Quick Branch Toggle**: One-click button to switch between `development` and `main` target branches
- 🚫 **Smart Branch Logic**: Prevents toggle button when source branch is `development` (avoids conflicts)
- 🎨 **Native Integration**: Seamlessly integrates with GitLab's existing UI without disrupting workflow
- ⚡ **Zero-Click Setup**: Works automatically - no manual dropdown selections needed

## 📦 Installation

### Method 1: Install from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shariar-Hasan/Gitlab-Automator.git
   cd Gitlab-Automator
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Toggle **"Developer mode"** (top-right corner)
   - Click **"Load unpacked"**
   - Select the `gitlab-automation` folder
   - Extension is now active! 🎉

### Method 2: Install from Chrome Web Store
*Coming soon...*

## 🚀 Usage

### Automatic Behavior
When you navigate to any GitLab merge request creation page, the extension automatically:

1. **Sets target branch to `development`** (if no target branch is specified in URL)
2. **Unchecks "Delete source branch"** option to protect your source branch
3. **Adds a toggle button** next to the target branch title

### Toggle Button Features
The extension adds a **yellow toggle button** next to the target branch title:

| Current Target | Button Text | Action |
|----------------|-------------|--------|
| `development` | "Change to main" | 🔄 Switches target to `main` branch |
| `main` | "Change to development" | � Switches target to `development` branch |

### Usage Steps
1. **Navigate** to any GitLab merge request page:
   ```
   https://gitlab.com/your-project/-/merge_requests/new
   ```

2. **Automatic setup**: Extension immediately sets `development` as target and protects source branch

3. **Optional**: Click the yellow toggle button to switch to `main` if needed

4. **Fill out** your merge request details (title, description, etc.)

5. **Submit** using GitLab's standard "Create merge request" button

### 💡 Pro Tips
- The extension works via URL parameters - changes are instant
- Source branch deletion is always disabled by default for safety
- Toggle button won't appear if your source branch is `development` (prevents conflicts)
- The extension stops monitoring after 5 seconds to preserve performance

## 🔄 Updating the Extension

### When Repository Updates
If this repository receives updates and you want the latest features:

1. **Pull latest changes**:
   ```bash
   cd path/to/Gitlab-Automator
   git pull origin main
   ```

2. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Find "gitlab-automation"
   - Click the **🔄 reload** button (circular arrow icon)
   - Or use the keyboard shortcut: `Ctrl+R` while on the extensions page

3. **Verify update**:
   - Check the version number in `manifest.json`
   - Test the extension on a GitLab MR page

### Automatic Update Notifications
*Currently manual updates only. Auto-update feature planned for future releases.*

## ⚙️ How It Works

The extension employs a smart URL-based approach with DOM manipulation:

```javascript
// Core functionality pipeline
1. � Check URL parameters for target branch
2. 🔄 Auto-redirect to set 'development' as default (if not set)
3. 🔒 Monitor and uncheck 'delete source branch' checkbox
4. 🎯 Inject toggle button next to target branch title
5. ⚡ Enable instant branch switching via URL parameters
6. � Stop monitoring after 5 seconds for performance
```

### Technical Implementation
- **URL Parameter Manipulation**: Uses `URLSearchParams` for instant branch switching
- **DOM Polling**: Monitors checkbox state and injects toggle button with `setInterval`
- **Conditional Logic**: Prevents toggle when source branch equals `development`
- **Performance Optimization**: Auto-stops monitoring after 5 seconds
- **Event Handling**: Custom click handler for branch toggle functionality

### Code Flow
```javascript
// On page load
if (no target branch in URL) → redirect with development target
while (monitoring active) {
  - uncheck delete source branch checkbox
  - add toggle button (if not exists and source ≠ development)
}
stop after 5 seconds
```

## 📁 Project Structure

```
gitlab-automation/
├── 📄 manifest.json      # Extension configuration & permissions
├── ⚙️ content.js         # Core functionality & DOM manipulation
├── 🖼️ icon.png           # Extension icon (48x48px)
└── 📚 Readme.md          # This documentation
```

## 🌐 Compatibility

| Browser | Support | Version |
|---------|---------|---------|
| Google Chrome | ✅ Full | 88+ |
| Microsoft Edge | ✅ Full | 88+ |
| Brave Browser | ✅ Full | Latest |
| Opera | ✅ Full | Latest |
| Firefox | ❌ Not supported | Manifest V3 required |

> **Note**: Uses Manifest V3 for enhanced security and performance.

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/awesome-enhancement
   ```
3. **Make** your changes and test thoroughly
4. **Commit** with descriptive messages:
   ```bash
   git commit -m "feat: add awesome enhancement for better UX"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/awesome-enhancement
   ```
6. **Open** a Pull Request with detailed description

### Development Setup
```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/Gitlab-Automator.git
cd Gitlab-Automator

# Load extension in Chrome for testing
# (Follow installation steps above)
```

### Code Style
- Use modern JavaScript (ES6+)
- Comment complex logic
- Follow existing naming conventions
- Test on actual GitLab pages

## 📝 License

This project is **open source** and available under the [MIT License](LICENSE).

Feel free to use, modify, and distribute as needed.

## 🆘 Support & Troubleshooting

### Common Issues
- **Extension not working**: Ensure you're on a GitLab MR creation page (`*/merge_requests/new*`)
- **Toggle button not appearing**: Refresh the page, or check if source branch is `development`
- **Auto-redirect not working**: Clear browser cache and try again
- **Checkbox keeps getting checked**: The extension monitors for 5 seconds - manual changes after this period will persist

### Expected Behavior
- ✅ Page redirects to set `development` target (if no target branch in URL)
- ✅ "Delete source branch" checkbox gets unchecked automatically
- ✅ Yellow toggle button appears next to target branch title
- ✅ Toggle button switches between `development` ↔ `main`
- ❌ Toggle button hidden when source branch = `development`

### Get Help
- 🐛 **Bug Reports**: [Open an issue](https://github.com/Shariar-Hasan/Gitlab-Automator/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/Shariar-Hasan/Gitlab-Automator/discussions)
- 📧 **Direct Contact**: Create an issue for support

---

## 🔗 Additional Info

**Target URL Pattern**: `https://gitlab.com/*/-/merge_requests/new*`

**Permissions Required**: 
- `scripting` - To inject content scripts on GitLab pages

**Privacy**: This extension only runs on GitLab.com and doesn't collect or transmit any user data. It works locally by manipulating URL parameters and DOM elements.

---

<div align="center">

**Made with ❤️ for the GitLab community**

⭐ Star this repo if it helped streamline your workflow!

</div>

