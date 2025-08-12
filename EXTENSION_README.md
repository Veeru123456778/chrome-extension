# YouTube Study Time Tracker Extension

A Chrome extension that helps you track and manage your YouTube viewing time by distinguishing between educational/study content and entertainment content.

## Features

- **Automatic Video Classification**: Uses YouTube API to classify videos as study-related or entertainment
- **Time Tracking**: Tracks study time vs fun time separately
- **Fun Time Limits**: Sets daily limits for entertainment content based on study time
- **Video Blocking**: Blocks entertainment videos when daily limits are exceeded
- **Progress Monitoring**: Visual dashboard showing your study vs fun time balance
- **Smart Detection**: Only counts time when videos are actually playing and you're actively viewing

## Recent Improvements (Latest Update)

### Enhanced Video Detection
- Improved detection of YouTube video pages with multiple fallback methods
- Better handling of YouTube's SPA navigation
- Periodic URL checking as backup for missed navigation events

### Reliable Time Tracking
- More accurate playback state detection
- Visibility change tracking (only counts time when tab is visible)
- Better handling of paused videos and background tabs
- Improved session management and cleanup

### Robust Communication
- Enhanced message passing between content script and service worker
- Better error handling and logging
- Improved initialization sequence

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd youtube-study-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### Production Installation

1. Download the latest release
2. Extract the files
3. Follow steps 4-6 from development setup

## Configuration

### First-Time Setup

1. **Set Study Area**: When you first open a YouTube video, the extension will prompt you to set your study area (e.g., "Computer Science", "Mathematics", "History")

2. **YouTube API Key** (Optional): For better video classification, you can add a YouTube API key in the settings

3. **Fun Time Limit**: Set how many minutes of fun content you're allowed per hour of study time (default: 20 minutes)

### Settings

- **Study Area**: Your primary field of study for content classification
- **Fun Time Limit**: Minutes of entertainment allowed per hour of study
- **Notifications**: Enable/disable blocking notifications
- **YouTube API Key**: For enhanced video classification (optional)

## How It Works

### Video Detection
1. When you open a YouTube video page, the content script detects the video
2. The service worker receives the video detection message
3. Video information is fetched and classified as study or entertainment

### Time Tracking
1. **Study Videos**: Time is tracked and added to your study time
2. **Entertainment Videos**: 
   - If within daily limits: Time is tracked as fun time
   - If limit exceeded: Video is blocked with an overlay

### Smart Features
- **Visibility Tracking**: Only counts time when the tab is visible
- **Playback Detection**: Only counts time when video is actually playing
- **Session Management**: Properly handles video changes and tab closures

## Usage

### Daily Workflow

1. **Start Studying**: Open educational YouTube videos related to your study area
2. **Monitor Progress**: Click the extension icon to see your daily stats
3. **Fun Time**: Watch entertainment videos within your daily limits
4. **Stay Focused**: When limits are exceeded, entertainment videos are blocked

### Dashboard Features

- **Daily Stats**: Study time vs fun time for today
- **Total Stats**: Overall study and fun time
- **Remaining Fun Time**: How much entertainment time you have left
- **Progress Charts**: Visual representation of your time distribution

## Troubleshooting

### Extension Not Working

1. **Check Console**: Open Developer Tools (F12) and check for errors
2. **Reload Extension**: Go to `chrome://extensions/` and click the reload button
3. **Check Permissions**: Ensure the extension has permission to access YouTube
4. **Clear Cache**: Clear browser cache and reload the page

### Video Not Detected

1. **Refresh Page**: Sometimes YouTube's dynamic loading can miss initial detection
2. **Check URL**: Ensure you're on a YouTube video page (`youtube.com/watch?v=...`)
3. **Wait for Load**: Give the page a moment to fully load

### Time Not Tracking

1. **Check Tab Visibility**: Make sure the YouTube tab is visible (not minimized)
2. **Verify Playback**: Ensure the video is actually playing (not paused)
3. **Check Settings**: Verify your study area is set up correctly

### Common Issues

- **"No study area set"**: Complete the first-time setup
- **"Fun time limit exceeded"**: Study more to unlock additional fun time
- **Videos not blocking**: Check that notifications are enabled in settings

## Development

### Project Structure

```
src/
├── content.ts          # Content script for YouTube pages
├── service-worker.ts   # Background service worker
├── App.tsx            # Extension popup UI
├── utils/
│   ├── storage.ts     # Data storage utilities
│   └── youtube-api.ts # YouTube API integration
└── assets/            # UI assets and styles
```

### Key Components

- **Content Script**: Detects videos, monitors playback, handles UI overlays
- **Service Worker**: Manages sessions, tracks time, handles classification
- **Storage**: Chrome storage API for settings and statistics
- **YouTube API**: Video information and classification

### Building

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Linting
npm run lint
```

## API Requirements

### YouTube Data API v3 (Optional)

For enhanced video classification, you can provide a YouTube API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the key in extension settings

**Note**: The extension works without an API key but with basic classification only.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter issues or have questions:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Open an issue on GitHub with detailed information

## Changelog

### Latest Version (1.0.0)
- ✅ Enhanced video detection reliability
- ✅ Improved time tracking accuracy
- ✅ Better visibility change handling
- ✅ Robust session management
- ✅ Enhanced error handling and logging
- ✅ Improved SPA navigation detection
- ✅ Better playback state monitoring