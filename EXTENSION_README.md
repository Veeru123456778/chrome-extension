# YouTube Study Time Tracker - Chrome Extension

A Chrome extension that helps you track and manage your YouTube viewing time, distinguishing between educational content and entertainment to improve productivity.

## Features

- **Automatic Video Classification**: Uses YouTube API to classify videos as educational or entertainment
- **Study Area Configuration**: Set your study area for more accurate classification
- **Time Tracking**: Tracks study time vs fun time separately
- **Smart Limits**: Automatically limits fun time based on your study time
- **Real-time Monitoring**: Monitors YouTube activity in real-time
- **Beautiful Dashboard**: Modern React-based popup interface with charts and statistics

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chrome-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build:extension
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/` folder from this project

### Production Build

The extension is built using Vite and includes a custom build script that:
- Bundles the React popup interface
- Creates standalone content script and service worker files
- Removes ES6 import statements for Chrome extension compatibility
- Copies all necessary files to the `dist/` directory

## Usage

1. **First Time Setup**
   - Click the extension icon in your browser toolbar
   - Set your study area (e.g., "Computer Science", "Mathematics", etc.)
   - Configure your fun time limit (default: 20 minutes per hour of study time)
   - Optionally add a YouTube API key for better video classification

2. **Daily Use**
   - Browse YouTube normally
   - The extension will automatically detect and classify videos
   - Educational videos will be tracked as study time
   - Entertainment videos will be tracked as fun time
   - When you reach your fun time limit, videos will be blocked

3. **Viewing Statistics**
   - Click the extension icon to see your daily and total statistics
   - View charts showing study vs fun time distribution
   - Check your remaining fun time for the day

## Configuration

### Study Areas
The extension supports the following study areas:
- Computer Science
- Mathematics
- Physics
- Chemistry
- Biology
- Engineering
- Medicine
- Business
- History
- Literature
- Psychology
- Philosophy

### YouTube API Key (Optional)
For better video classification, you can add a YouTube API key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API key)
5. Add the API key in the extension settings

## Technical Details

### Architecture
- **Content Script**: Monitors YouTube pages and tracks video playback
- **Service Worker**: Manages data storage and coordinates between tabs
- **Popup Interface**: React-based UI for settings and statistics
- **YouTube API Integration**: Classifies videos based on category and content

### Data Storage
- Uses Chrome's local storage API
- Stores settings, time statistics, and session history
- Data is automatically reset daily

### Permissions
- `storage`: For saving settings and statistics
- `activeTab`: For accessing current tab information
- `scripting`: For injecting content scripts
- `tabs`: For monitoring tab changes
- `background`: For service worker functionality
- `notifications`: For optional notifications

## Development

### Project Structure
```
├── src/
│   ├── App.jsx              # Main React popup component
│   ├── content.js           # Content script for YouTube pages
│   ├── service-worker.js    # Background service worker
│   └── utils/               # Utility functions
├── public/
│   ├── manifest.json        # Extension manifest
│   └── icons/               # Extension icons
├── dist/                    # Built extension files
└── scripts/
    └── build-extension.js   # Custom build script
```

### Build Process
1. `npm run build:extension` - Builds the complete extension
2. Vite bundles the React app and dependencies
3. Custom script processes content script and service worker
4. Files are copied to `dist/` directory ready for loading

### Debugging
- Check the browser console for extension logs
- Use Chrome DevTools for the popup (right-click extension icon → Inspect)
- Service worker logs appear in the Extensions page

## Troubleshooting

### Common Issues

1. **Extension not working on YouTube**
   - Ensure the extension is enabled
   - Check that you're on a YouTube page
   - Refresh the page after installing

2. **Import statement errors**
   - Run `npm run build:extension` to rebuild
   - Clear browser cache and reload extension

3. **Video classification not working**
   - Check if YouTube API key is configured
   - Verify study area is set in extension settings

4. **Time not being tracked**
   - Ensure the video is actually playing
   - Check that the tab is visible (not minimized)
   - Verify extension permissions

### Support
For issues or questions, please check the console logs and ensure you're using the latest version of the extension.

## License

This project is licensed under the MIT License.