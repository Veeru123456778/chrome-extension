# YouTube Study Time Tracker - Chrome Extension

A comprehensive Chrome extension that monitors YouTube activity in real-time to track study time vs fun time, helping users improve their productivity.

## 🚀 Features

### ✅ Core Functionality
- **Real-time YouTube activity monitoring** - Automatically detects when you watch YouTube videos
- **Smart video categorization** - Uses YouTube Data API + NLP to classify videos as study or fun content
- **Study area configuration** - Set your main study area (Computer Science, Medical, Law, etc.) for accurate tracking
- **Time tracking with precision** - Only tracks actual watch time (no cheating via pausing, muting, or skipping)
- **Multiple tab support** - Handles multiple YouTube tabs and videos independently

### 📊 Analytics & Visualization
- **Beautiful pie chart** (Chart.js) showing daily study vs fun time breakdown
- **Productivity percentage** - Real-time calculation of your daily productivity
- **Comprehensive statistics** - Total study time, fun time, and remaining fun time
- **Time formatting** - Smart time display (seconds, minutes, hours)

### ⏰ Fun Time Management
- **Configurable fun time limits** - Default 20 minutes of fun per hour of study
- **Warning system** - Alerts when approaching fun time limit
- **Smart blocking** - Automatically blocks videos when fun time limit is exceeded
- **Video blocking overlay** - Prevents bypassing blocks with keyboard shortcuts

### 🎯 Smart Classification
- **YouTube API integration** - Fetches video categories and metadata
- **NLP analysis** - Analyzes video titles, descriptions, and tags
- **Study area matching** - Relates content to your specific field of study
- **User feedback** - Ask user when classification is uncertain
- **Fallback detection** - Works even without API key using page content

### 🔧 Advanced Features
- **First-time setup flow** - Guided configuration for new users
- **Settings management** - Easily update study area and fun time limits
- **Data persistence** - All data stored locally using chrome.storage
- **Session management** - Handles browser crashes, tab closes, and refreshes
- **Edge case handling** - Robust handling of network issues, tab switching, etc.

## 📦 Installation

### From Source (Development)

1. **Clone and build the extension:**
   ```bash
   cd /workspace
   npm install
   npm run build
   ```

2. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project

3. **Grant permissions:**
   - The extension will request permissions for YouTube access and storage
   - Accept all permissions for full functionality

### From Chrome Web Store
*Coming soon - extension will be published after testing*

## 🛠️ Setup & Configuration

### First Time Setup
1. Click the extension icon in your toolbar
2. Select your main study area from the dropdown
3. Adjust fun time limit (5-30 minutes per hour of study)
4. (Optional) Add YouTube Data API key for better categorization

### Getting YouTube API Key (Optional but Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key in extension settings

## 📱 Usage

### Daily Workflow
1. **Start studying** - Open YouTube and watch educational content
2. **Classification** - Extension automatically categorizes videos or asks for your input
3. **Track progress** - Monitor your productivity in real-time via the popup
4. **Fun time management** - Enjoy entertainment within your configured limits

### Understanding the Interface

#### Home Tab
- **Productivity Circle** - Visual representation of your daily productivity percentage
- **Time Summary** - Today's study time and fun time
- **Activity Chart** - Pie chart showing time distribution
- **Stats Grid** - Key metrics including remaining fun time

#### Settings Tab
- **Study Area** - Update your field of study
- **Fun Time Limit** - Adjust minutes of fun per hour of study
- **API Key** - Add/update YouTube Data API key
- **Notifications** - Enable/disable notifications

#### Stats Tab
- **Total Statistics** - All-time study and fun time
- **Bar Chart** - Visual comparison of cumulative hours

### Video Classification
The extension uses a sophisticated classification system:

1. **Automatic Classification:**
   - Educational categories (Education, Science & Technology, News & Politics) → Usually study
   - Entertainment categories → Usually fun
   - Combines category data with content analysis

2. **Manual Classification:**
   - When uncertain, extension asks: "Is this related to your [study area] studies?"
   - Your response helps improve future classifications

3. **Content Analysis:**
   - Analyzes video titles, descriptions, and tags
   - Matches against study area keywords
   - Uses NLP scoring system

## 🔒 Privacy & Security

- **Local storage only** - All data stored locally using Chrome's storage API
- **No data collection** - Extension doesn't send any data to external servers
- **API key security** - YouTube API key stored locally, never transmitted
- **Minimal permissions** - Only requests necessary permissions for YouTube access

## 🐛 Troubleshooting

### Extension Not Working
1. Check if extension is enabled in `chrome://extensions/`
2. Refresh YouTube tabs after installation
3. Ensure you're on a YouTube video page (`youtube.com/watch`)

### Videos Not Being Detected
1. Make sure you're on a video page (not homepage or search)
2. Wait a few seconds for detection to trigger
3. Check browser console for error messages

### Classification Issues
1. Add YouTube API key for better accuracy
2. Manually classify a few videos to help the system learn
3. Ensure your study area is set correctly

### Time Tracking Problems
1. Verify the video is actually playing (not paused)
2. Check if you have multiple YouTube tabs open
3. Extension only tracks when video is actively playing

## 🔧 Technical Details

### Architecture
- **Manifest V3** - Modern Chrome extension standard
- **Service Worker** - Background processing for time tracking
- **Content Script** - YouTube page interaction and video detection
- **React + TypeScript** - Modern popup interface
- **Chart.js** - Data visualization
- **Chrome Storage API** - Local data persistence

### File Structure
```
dist/
├── manifest.json          # Extension configuration
├── service-worker.js      # Background time tracking
├── content.js            # YouTube page interaction
├── index.html            # Popup interface
├── assets/               # CSS and JS bundles
└── icons/               # Extension icons
```

### Data Storage
All data is stored locally using Chrome's storage API:
- Settings (study area, fun time limit, API key)
- Time statistics (daily and total time)
- Active sessions (current video tracking)
- Session history (past video sessions)

## 📈 Roadmap

### Planned Features
- **Weekly/Monthly statistics** - Extended time period analysis
- **Goal setting** - Set daily study time goals
- **Streaks tracking** - Monitor consecutive productive days
- **Export data** - Download your statistics
- **Improved NLP** - Better content classification
- **Custom categories** - User-defined video categories
- **Focus mode** - Temporarily block all fun content

### Known Limitations
- Requires active internet for YouTube API features
- Limited to YouTube platform only
- Some videos may require manual classification
- Fun time blocking can be bypassed by disabling the extension

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report bugs** - Open issues with detailed descriptions
2. **Suggest features** - Propose new functionality
3. **Improve classification** - Help enhance the NLP algorithms
4. **UI/UX improvements** - Make the interface more user-friendly
5. **Documentation** - Help improve this guide

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Chart.js** - Beautiful data visualization
- **YouTube Data API** - Video metadata and categorization
- **React ecosystem** - Modern UI development
- **Chrome Extensions API** - Powerful browser integration

---

**Happy studying! 📚✨**

*Made with ❤️ to help students stay productive while enjoying YouTube*