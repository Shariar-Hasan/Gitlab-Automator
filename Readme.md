# GitLab MR Enhancer

A Chrome extension that enhances GitLab merge request creation with quick shortcuts to target the development branch and control source branch deletion settings.

## Features

- **Quick Development Branch Targeting**: Automatically set merge requests to target the `development` branch
- **Source Branch Control**: Choose whether to delete or keep the source branch after merge
- **Form Validation**: Ensures all required fields are filled before submission
- **Clean UI Integration**: Seamlessly integrates with GitLab's existing interface

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/Shariar-Hasan/Gitlab-Automator.git
   cd Gitlab-Automator
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the project directory

5. The extension will be installed and ready to use

## Usage

1. Navigate to any GitLab merge request creation page (`https://gitlab.com/*/merge_requests/new`)

2. You'll see two new buttons alongside the default "Create merge request" button:

   - **Create MR with Development** (Green): Sets target branch to `development` and keeps source branch
   - **Create MR with Development and Delete Source** (Red): Sets target branch to `development` and enables source branch deletion

3. Fill out the required merge request fields (title, description, etc.)

4. Click one of the enhanced buttons to create your merge request with the desired settings

## How It Works

The extension uses a content script that:

1. Waits for the GitLab merge request form to load
2. Locates the target branch dropdown and source branch deletion checkbox
3. Adds two custom buttons with predefined actions
4. Validates the form before submission to ensure all required fields are completed

## Files Structure

```
gitlab-automation/
├── manifest.json     # Extension configuration
├── content.js        # Main functionality script
├── icon.png         # Extension icon
└── Readme.md        # Documentation
```

## Browser Compatibility

- Chrome (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source. Feel free to use, modify, and distribute as needed.

## Support

If you encounter any issues or have suggestions for improvements, please open an issue on the GitHub repository.

---

**Note**: This extension only works on GitLab.com merge request creation pages. It automatically activates when you visit a URL matching the pattern `https://gitlab.com/*/-/merge_requests/new*`.

