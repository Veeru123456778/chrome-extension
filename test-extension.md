# Extension Testing Guide

## Quick Test Steps

### 1. Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. Verify the extension appears in your extensions list

### 2. Initial Setup Test
1. Open a YouTube video page (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
2. You should see a setup dialog asking for your study area
3. Select a study area (e.g., "Computer Science")
4. Set fun time limit (default: 20 minutes)
5. Click "Save Settings"

### 3. Video Detection Test
1. Open a different YouTube video
2. Check the browser console (F12) for these messages:
   ```
   YouTube Study Tracker Content Script Starting...
   Initial video page detected
   New video detected: [video-id]
   Found video element: [selector]
   Video event listeners set up
   Started playback monitoring
   ```

### 4. Service Worker Test
1. Check the service worker console for:
   ```
   YouTube Study Tracker Service Worker Starting...
   Extension initialized successfully
   Service worker received message: VIDEO_DETECTED
   Video detected in tab [tab-id]: [video-id]
   ```

### 5. Time Tracking Test
1. Play a video for at least 10 seconds
2. Check console for time tracking messages:
   ```
   Adding [X] seconds of [study/fun] time for tab [tab-id]
   ```
3. Click the extension icon to see updated stats

### 6. Fun Time Limit Test
1. Watch entertainment videos until you reach your fun time limit
2. You should see a blocking overlay appear
3. The video should be blocked from playing

## Expected Behavior

### ✅ Working Correctly
- Extension icon appears in toolbar
- Setup dialog appears on first video visit
- Video detection messages in console
- Time tracking updates in real-time
- Stats update in popup
- Fun time limits enforced

### ❌ Issues to Check
- No console messages: Check if content script is loading
- No video detection: Verify you're on a YouTube video page
- No time tracking: Check if video is playing and tab is visible
- Extension not loading: Verify manifest.json and file paths

## Debug Information

### Console Messages to Look For
```
Content Script:
- "YouTube Study Tracker Content Script Starting..."
- "Initial video page detected"
- "New video detected: [video-id]"
- "Found video element: [selector]"
- "Playback state: {isPlaying: true, ...}"

Service Worker:
- "YouTube Study Tracker Service Worker Starting..."
- "Extension initialized successfully"
- "Video detected in tab [tab-id]: [video-id]"
- "Adding [X] seconds of [study/fun] time"
```

### Common Error Messages
```
- "No video element found": YouTube page not fully loaded
- "Could not get playback state": Content script communication issue
- "No active session found": Session management issue
- "Fun time limit exceeded": Working as intended
```

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Setup dialog appears on first visit
- [ ] Video detection works on different videos
- [ ] Time tracking counts only when playing
- [ ] Stats update in popup
- [ ] Fun time limits work
- [ ] Video blocking overlay appears
- [ ] Multiple tabs handled correctly
- [ ] Extension survives page refresh
- [ ] Cleanup works when leaving YouTube

## Performance Notes

- Time tracking updates every 5 seconds
- URL checking every 2 seconds
- Playback monitoring every 2 seconds
- Console logs help verify timing

## Troubleshooting

If tests fail:
1. Check browser console for errors
2. Reload the extension
3. Clear browser cache
4. Verify all files are in the dist folder
5. Check manifest.json permissions