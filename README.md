# YouTube Study Time Tracker Extension

A Chrome extension that helps you track and manage your study time vs fun time while watching YouTube videos. The extension automatically classifies videos based on your study area and enforces fun time limits to improve productivity.

## Features

- **Automatic Video Classification**: Classifies YouTube videos as study or fun based on category and your study area
- **Time Tracking**: Tracks study time and fun time separately with daily and total statistics
- **Fun Time Limits**: Enforces limits on fun video watching based on your study time
- **Video Blocking**: Automatically blocks videos when fun time limit is exceeded
- **YouTube Theme**: Beautiful UI that matches YouTube's design
- **Real-time Monitoring**: Background service worker continuously monitors video activity
- **User Classification**: Allows manual classification when automatic detection is uncertain

## Installation

1. **Clone or download this repository**
2. **Build the extension**:
   ```bash
   npm install
   npm run build
   ```
3. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `public` folder from this project

## Setup

1. **First-time setup**: When you first open the extension, you'll be prompted to:
   - Select your study area (Computer Science, Mathematics, Physics, etc.)
   - Set your fun time limit (minutes per hour of study)
   - Enable/disable notifications

2. **Optional**: Add a YouTube API key for better video classification:
   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project and enable YouTube Data API v3
   - Generate an API key and add it in the extension settings

## How It Works

### Video Detection
- The extension automatically detects when you're watching YouTube videos
- It monitors video playback state (playing, paused, ended)
- Tracks tab visibility to only count time when you're actively viewing

### Classification System
- **Study Videos**: Educational content related to your study area
- **Fun Videos**: Entertainment content not related to your studies
- **Unknown**: Videos that need manual classification

### Time Tracking
- **Study Time**: Time spent watching educational videos
- **Fun Time**: Time spent watching entertainment videos
- **Fun Time Limit**: Calculated as `(study time in hours × limit) + 10 minutes base allowance`

### Video Blocking
- When fun time limit is exceeded, videos are automatically blocked
- A blocking overlay appears with a message
- Videos can be unblocked by closing the overlay

## Usage

1. **Browse YouTube normally** - the extension works in the background
2. **Check your stats** - click the extension icon to see your dashboard
3. **Classify videos** - when prompted, choose if a video is study or fun related
4. **Manage settings** - adjust your study area, time limits, and preferences

## Study Areas Supported

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

## Technical Details

- **Service Worker**: Handles background monitoring and time tracking
- **Content Script**: Detects videos and manages UI overlays
- **Storage**: Uses Chrome's local storage for settings and statistics
- **YouTube API**: Optional integration for better video classification
- **React**: Modern UI built with React and Chart.js

## Troubleshooting

### Extension not working
- Make sure the extension is enabled in Chrome
- Check the browser console for error messages
- Try reloading the extension

### Videos not being detected
- Ensure you're on a YouTube video page (URL contains `/watch`)
- Check if the content script is running (look for console logs)
- Try refreshing the page

### Time not being tracked
- Make sure the video is actually playing
- Check if the tab is visible (not minimized)
- Verify that the service worker is active

### Data not updating
- The extension updates every 5 seconds
- Try clicking the extension icon to refresh
- Check if there are any console errors

## Development

To modify the extension:

1. **Edit source files** in the `src` directory
2. **Build changes**: `npm run build`
3. **Copy files**: The build process automatically copies files to `public/`
4. **Reload extension**: Go to `chrome://extensions/` and click the reload button

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
