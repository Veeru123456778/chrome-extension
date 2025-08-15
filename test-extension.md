# Testing the YouTube Study Tracker Extension

## Pre-Testing Setup

1. **Build the extension**:
   ```bash
   npm run build
   ```

2. **Load in Chrome**:
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `public` folder

3. **Open Developer Tools**:
   - Press F12 to open DevTools
   - Go to Console tab to see extension logs

## Test Scenarios

### 1. Initial Setup Test
- [ ] Click the extension icon
- [ ] Verify setup screen appears
- [ ] Select a study area (e.g., Computer Science)
- [ ] Set fun time limit to 20 minutes
- [ ] Click "Get Started"
- [ ] Verify dashboard appears

### 2. Video Detection Test
- [ ] Go to YouTube and open any video
- [ ] Check console for "Video detected" message
- [ ] Verify extension shows "Tracking study/fun time" notification
- [ ] Check extension popup shows updated stats

### 3. Study Video Classification Test
- [ ] Open an educational video (e.g., programming tutorial)
- [ ] Verify it's classified as "study" automatically
- [ ] Check that study time increases in dashboard
- [ ] Verify no blocking overlay appears

### 4. Fun Video Classification Test
- [ ] Open an entertainment video (e.g., music video, comedy)
- [ ] Verify it's classified as "fun" automatically
- [ ] Check that fun time increases in dashboard
- [ ] Watch until fun time limit is reached
- [ ] Verify blocking overlay appears

### 5. Manual Classification Test
- [ ] Open a video that's unclear (e.g., news, mixed content)
- [ ] Verify classification dialog appears
- [ ] Choose "Study Video" or "Fun Video"
- [ ] Verify tracking starts correctly

### 6. Time Tracking Accuracy Test
- [ ] Open a study video
- [ ] Play for exactly 60 seconds
- [ ] Check dashboard shows ~1 minute of study time
- [ ] Pause video and verify time stops counting
- [ ] Switch tabs and verify time stops counting

### 7. Fun Time Limit Test
- [ ] Watch study videos to accumulate study time
- [ ] Then watch fun videos until limit is reached
- [ ] Verify blocking overlay appears
- [ ] Check overlay message is correct
- [ ] Click "Close" and verify video is unblocked

### 8. Settings Test
- [ ] Go to Settings tab in extension
- [ ] Change study area
- [ ] Adjust fun time limit
- [ ] Toggle notifications
- [ ] Verify changes are saved

### 9. Data Persistence Test
- [ ] Accumulate some study/fun time
- [ ] Close and reopen browser
- [ ] Verify data is still there
- [ ] Check daily stats reset at midnight

### 10. Multiple Tabs Test
- [ ] Open YouTube videos in multiple tabs
- [ ] Verify each tab is tracked independently
- [ ] Close tabs and verify sessions end properly

## Expected Console Messages

### Service Worker
```
YouTube Study Tracker Service Worker Starting...
Storage initialized successfully
Extension initialized successfully
Video detected in tab [ID]: [videoId]
Started study/fun session for video: [title]
Adding [X] seconds of study/fun time for tab [ID]
Fun time limit exceeded, blocking video
```

### Content Script
```
YouTube Study Tracker Content Script Starting...
Initial video page detected
New video page loaded: [videoId]
Setting up video tracking for element: [element]
Video started playing
Notified service worker about video detection
```

## Common Issues and Solutions

### Issue: Extension not loading
**Solution**: Check manifest.json is valid, ensure all files are in public folder

### Issue: Videos not detected
**Solution**: Verify content script is running, check URL patterns match

### Issue: Time not tracking
**Solution**: Check video element detection, verify service worker is active

### Issue: Stats not updating
**Solution**: Check storage permissions, verify message passing works

### Issue: Blocking not working
**Solution**: Check fun time calculation, verify overlay injection

## Performance Testing

- [ ] Extension loads quickly (< 2 seconds)
- [ ] Video detection is responsive (< 1 second)
- [ ] Time tracking is accurate (±5 seconds)
- [ ] Dashboard updates smoothly
- [ ] No memory leaks after extended use

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Other Chromium-based browsers

## Security Testing

- [ ] No sensitive data in console logs
- [ ] API keys are stored securely
- [ ] No XSS vulnerabilities in overlays
- [ ] Proper permission usage

## Final Verification

After completing all tests:

1. **Check all functionality works** as expected
2. **Verify no console errors** remain
3. **Test edge cases** (network issues, rapid tab switching)
4. **Document any issues** found
5. **Extension is ready** for use

## Reporting Issues

If you find issues:

1. **Note the exact steps** to reproduce
2. **Include console logs** and error messages
3. **Specify browser version** and OS
4. **Describe expected vs actual behavior**
5. **Include screenshots** if relevant