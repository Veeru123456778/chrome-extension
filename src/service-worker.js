// Service Worker for YouTube Study Time Tracker Extension

// Include storage functions directly to avoid import issues
const DEFAULT_SETTINGS = {
  studyArea: null,
  funTimeLimit: 20,
  isFirstTime: true,
  notifications: true
};

const DEFAULT_TIME_STATS = {
  totalStudyTime: 0,
  totalFunTime: 0,
  dailyStudyTime: 0,
  dailyFunTime: 0,
  lastResetDate: new Date().toISOString().split('T')[0]
};

const STORAGE_KEYS = {
  SETTINGS: 'settings',
  TIME_STATS: 'timeStats',
  ACTIVE_SESSIONS: 'activeSessions',
  SESSION_HISTORY: 'sessionHistory'
};

async function getSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    return result.settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

async function updateSettings(updates) {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...updates };
    
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: newSettings });
    console.log('Settings updated:', newSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

async function getTimeStats() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.TIME_STATS);
    return result.timeStats || DEFAULT_TIME_STATS;
  } catch (error) {
    console.error('Error getting time stats:', error);
    return DEFAULT_TIME_STATS;
  }
}

async function addTime(isStudy, seconds) {
  try {
    const timeStats = await getTimeStats();
    const today = new Date().toISOString().split('T')[0];
    
    // Reset daily stats if it's a new day
    if (timeStats.lastResetDate !== today) {
      timeStats.dailyStudyTime = 0;
      timeStats.dailyFunTime = 0;
      timeStats.lastResetDate = today;
    }
    
    // Add time
    if (isStudy) {
      timeStats.totalStudyTime += seconds;
      timeStats.dailyStudyTime += seconds;
    } else {
      timeStats.totalFunTime += seconds;
      timeStats.dailyFunTime += seconds;
    }
    
    await chrome.storage.local.set({ [STORAGE_KEYS.TIME_STATS]: timeStats });
    console.log(`Added ${seconds} seconds to ${isStudy ? 'study' : 'fun'} time`);
  } catch (error) {
    console.error('Error adding time:', error);
    throw error;
  }
}

async function getActiveSessions() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_SESSIONS);
    return result.activeSessions || {};
  } catch (error) {
    console.error('Error getting active sessions:', error);
    return {};
  }
}

async function updateActiveSession(tabId, session) {
  try {
    const activeSessions = await getActiveSessions();
    activeSessions[tabId.toString()] = session;
    
    await chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_SESSIONS]: activeSessions });
    console.log(`Updated active session for tab ${tabId}`);
  } catch (error) {
    console.error('Error updating active session:', error);
    throw error;
  }
}

async function removeActiveSession(tabId) {
  try {
    const activeSessions = await getActiveSessions();
    const session = activeSessions[tabId.toString()];
    
    if (session) {
      delete activeSessions[tabId.toString()];
      await chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_SESSIONS]: activeSessions });
      console.log(`Removed active session for tab ${tabId}`);
      return session;
    }
    
    return null;
  } catch (error) {
    console.error('Error removing active session:', error);
    throw error;
  }
}

async function addSessionToHistory(session) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SESSION_HISTORY);
    const sessionHistory = result.sessionHistory || [];
    
    // Add session to history
    sessionHistory.push({
      ...session,
      endTime: session.endTime || Date.now()
    });
    
    // Keep only last 100 sessions
    if (sessionHistory.length > 100) {
      sessionHistory.splice(0, sessionHistory.length - 100);
    }
    
    await chrome.storage.local.set({ [STORAGE_KEYS.SESSION_HISTORY]: sessionHistory });
    console.log('Added session to history:', session.title);
  } catch (error) {
    console.error('Error adding session to history:', error);
    throw error;
  }
}

async function isFunTimeLimitExceeded() {
  try {
    const settings = await getSettings();
    const timeStats = await getTimeStats();
    
    // Calculate fun time limit based on study time
    const studyTimeHours = timeStats.dailyStudyTime / 3600; // Convert to hours
    const funTimeLimitMinutes = settings.funTimeLimit * studyTimeHours;
    const funTimeLimitSeconds = funTimeLimitMinutes * 60;
    
    // Add a base allowance of 10 minutes
    const totalFunTimeLimit = funTimeLimitSeconds + (10 * 60);
    
    console.log(`Fun time check: ${timeStats.dailyFunTime}s / ${totalFunTimeLimit}s limit`);
    
    return timeStats.dailyFunTime >= totalFunTimeLimit;
  } catch (error) {
    console.error('Error checking fun time limit:', error);
    return false;
  }
}

async function getRemainingFunTime() {
  try {
    const settings = await getSettings();
    const timeStats = await getTimeStats();
    
    // Calculate fun time limit based on study time
    const studyTimeHours = timeStats.dailyStudyTime / 3600; // Convert to hours
    const funTimeLimitMinutes = settings.funTimeLimit * studyTimeHours;
    const funTimeLimitSeconds = funTimeLimitMinutes * 60;
    
    // Add a base allowance of 10 minutes
    const totalFunTimeLimit = funTimeLimitSeconds + (10 * 60);
    
    const remaining = Math.max(0, totalFunTimeLimit - timeStats.dailyFunTime);
    return Math.floor(remaining / 60); // Return in minutes
  } catch (error) {
    console.error('Error getting remaining fun time:', error);
    return 0;
  }
}

async function resetAllData() {
  try {
    await chrome.storage.local.clear();
    await initializeStorage();
    console.log('All data reset successfully');
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
}

async function initializeStorage() {
  try {
    const keys = [STORAGE_KEYS.SETTINGS, STORAGE_KEYS.TIME_STATS, STORAGE_KEYS.ACTIVE_SESSIONS, STORAGE_KEYS.SESSION_HISTORY];
    const result = await chrome.storage.local.get(keys);
    
    const updates = {};
    
    if (!result.settings) {
      updates.settings = DEFAULT_SETTINGS;
    }
    
    if (!result.timeStats) {
      updates.timeStats = DEFAULT_TIME_STATS;
    } else {
      // Check if we need to reset daily stats
      const timeStats = result.timeStats;
      const today = new Date().toISOString().split('T')[0];
      if (timeStats.lastResetDate !== today) {
        updates.timeStats = {
          ...timeStats,
          dailyStudyTime: 0,
          dailyFunTime: 0,
          lastResetDate: today
        };
      }
    }
    
    if (!result.activeSessions) {
      updates.activeSessions = {};
    }
    
    if (!result.sessionHistory) {
      updates.sessionHistory = [];
    }
    
    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await chrome.storage.local.set(updates);
    }
    
    console.log('Storage initialized successfully');
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
}

// Include video classification functions
function extractVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

async function classifyVideo(videoId, studyArea, apiKey) {
  try {
    console.log(`Classifying video ${videoId} for study area: ${studyArea}`);
    
    // Simple classification without API for now
    return {
      videoInfo: {
        title: 'Unknown Video',
        categoryName: 'Unknown',
        categoryId: 0
      },
      isEducationalCategory: false,
      isRelatedToStudyArea: false,
      recommendedClassification: 'unknown',
      confidence: 0.5
    };
  } catch (error) {
    console.error('Error classifying video:', error);
    return {
      videoInfo: {
        title: 'Error classifying video',
        categoryName: 'Unknown',
        categoryId: 0
      },
      isEducationalCategory: false,
      isRelatedToStudyArea: false,
      recommendedClassification: 'unknown',
      confidence: 0.0
    };
  }
}

// Track active sessions in memory for quick access
const activeTabSessions = new Map();

// Track intervals for each tab
const timeTrackingIntervals = new Map();

console.log('YouTube Study Tracker Service Worker Starting...');

/**
 * Initialize the extension on startup
 */
async function initialize() {
  try {
    console.log('Initializing extension storage...');
    await initializeStorage();
    
    // Clean up any stale sessions from previous browser session
    await cleanupStaleSessions();
    
    console.log('Extension initialized successfully');
  } catch (error) {
    console.error('Error initializing extension:', error);
  }
}

/**
 * Clean up sessions that may be left over from previous browser session
 */
async function cleanupStaleSessions() {
  try {
    const activeSessions = await getActiveSessions();
    
    // Check which tabs are still active
    const tabs = await chrome.tabs.query({});
    const activeTabIds = new Set(tabs.map(tab => tab.id?.toString()).filter(Boolean));
    
    // Remove sessions for tabs that no longer exist
    for (const tabIdStr in activeSessions) {
      const session = activeSessions[tabIdStr];
      if (!activeTabIds.has(tabIdStr)) {
        console.log(`Cleaning up stale session for tab ${tabIdStr}`);
        const tabId = parseInt(tabIdStr);
        await removeActiveSession(tabId);
        
        // Save the session to history if it had significant watch time
        if (session.watchTime > 30) { // 30 seconds minimum
          await addSessionToHistory({
            ...session,
            endTime: Date.now()
          });
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up stale sessions:', error);
  }
}

/**
 * Handle video detection from content script
 */
async function handleVideoDetected(message, sender) {
  if (!sender.tab?.id || !message.data?.url) {
    console.warn('Invalid video detection message:', message);
    return;
  }
  
  const tabId = sender.tab.id;
  const url = message.data.url;
  const videoId = message.data.videoId || extractVideoId(url);
  
  if (!videoId) {
    console.warn('Could not extract video ID from URL:', url);
    return;
  }
  
  console.log(`Video detected in tab ${tabId}: ${videoId}`);
  
  try {
    // Stop any existing tracking for this tab
    await stopTimeTracking(tabId);
    
    // Get user settings
    const settings = await getSettings();
    
    if (!settings.studyArea) {
      console.log('No study area set, requesting first-time setup');
      await chrome.tabs.sendMessage(tabId, {
        type: 'SHOW_SETUP',
        data: { isFirstTime: true }
      });
      return;
    }
    
    // Classify the video
    const classification = await classifyVideo(
      videoId, 
      settings.studyArea.name, 
      settings.youtubeApiKey
    );
    
    console.log('Video classification result:', classification);
    
    let videoClassification = 'unknown';
    
    // Auto-classify if we have strong indicators
    if (classification.recommendedClassification === 'study') {
      videoClassification = 'study';
      await startVideoSession(tabId, videoId, url, classification.videoInfo, true);
    } else if (classification.recommendedClassification === 'fun') {
      videoClassification = 'fun';
      
      // Check if fun time limit is exceeded
      const isLimitExceeded = await isFunTimeLimitExceeded();
      if (isLimitExceeded) {
        console.log('Fun time limit exceeded, blocking video');
        await blockVideo(tabId, 'Fun time limit exceeded for today');
        return;
      }
      
      await startVideoSession(tabId, videoId, url, classification.videoInfo, false);
    } else {
      // Ask user for classification
      await chrome.tabs.sendMessage(tabId, {
        type: 'REQUEST_CLASSIFICATION',
        data: {
          videoInfo: classification.videoInfo,
          isEducationalCategory: classification.isEducationalCategory,
          isRelatedToStudyArea: classification.isRelatedToStudyArea,
          studyArea: settings.studyArea.name
        }
      });
      return;
    }
    
    // Store tab session info
    activeTabSessions.set(tabId, {
      tabId,
      videoId,
      url,
      isBlocked: false,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      classification: videoClassification,
      isVisible: true // Assume visible when detected
    });
    
  } catch (error) {
    console.error('Error handling video detection:', error);
  }
}

/**
 * Start a video session and begin time tracking
 */
async function startVideoSession(tabId, videoId, url, videoInfo, isStudy) {
  try {
    const session = {
      videoId,
      title: videoInfo?.title || 'Unknown Video',
      category: videoInfo?.categoryName || 'Unknown',
      categoryId: videoInfo?.categoryId || 0,
      isStudyRelated: isStudy,
      startTime: Date.now(),
      watchTime: 0,
      tabId,
      url
    };
    
    await updateActiveSession(tabId, session);
    await startTimeTracking(tabId);
    
    console.log(`Started ${isStudy ? 'study' : 'fun'} session for video: ${videoInfo?.title}`);
    
    // Notify content script
    await chrome.tabs.sendMessage(tabId, {
      type: 'SESSION_STARTED',
      data: { 
        isStudy, 
        videoInfo,
        classification: isStudy ? 'study' : 'fun'
      }
    });
    
  } catch (error) {
    console.error('Error starting video session:', error);
  }
}

/**
 * Start time tracking for a tab
 */
async function startTimeTracking(tabId) {
  // Clear any existing interval
  if (timeTrackingIntervals.has(tabId)) {
    clearInterval(timeTrackingIntervals.get(tabId));
  }
  
  // Start new tracking interval (update every 5 seconds)
  const interval = setInterval(async () => {
    try {
      await updateSessionTime(tabId);
    } catch (error) {
      console.error('Error in time tracking interval:', error);
      clearInterval(interval);
      timeTrackingIntervals.delete(tabId);
    }
  }, 5000);
  
  timeTrackingIntervals.set(tabId, interval);
  console.log(`Started time tracking for tab ${tabId}`);
}

/**
 * Stop time tracking for a tab
 */
async function stopTimeTracking(tabId) {
  if (timeTrackingIntervals.has(tabId)) {
    clearInterval(timeTrackingIntervals.get(tabId));
    timeTrackingIntervals.delete(tabId);
    console.log(`Stopped time tracking for tab ${tabId}`);
  }
  
  // Final time update
  await updateSessionTime(tabId, true);
}

/**
 * Handle visibility change from content script
 */
async function handleVisibilityChange(message, sender) {
  if (!sender.tab?.id) return;
  
  const tabId = sender.tab.id;
  const isVisible = message.data?.isVisible;
  
  console.log(`Tab ${tabId} visibility changed to: ${isVisible}`);
  
  // Update tab session visibility
  const tabSession = activeTabSessions.get(tabId);
  if (tabSession) {
    tabSession.isVisible = isVisible;
    activeTabSessions.set(tabId, tabSession);
  }
}

/**
 * Update session time and check for fun time limit
 */
async function updateSessionTime(tabId, isEnding = false) {
  try {
    const activeSessions = await getActiveSessions();
    const session = activeSessions[tabId.toString()];
    
    if (!session) {
      console.log(`No active session found for tab ${tabId}`);
      return;
    }
    
    // Check if video is actually playing by asking content script
    let isPlaying = false;
    let currentTime = 0;
    
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: 'GET_PLAYBACK_STATE' });
      isPlaying = response?.isPlaying || false;
      currentTime = response?.currentTime || 0;
    } catch (error) {
      console.log(`Could not get playback state for tab ${tabId}, assuming not playing`);
      isPlaying = false;
    }
    
    // Check if tab is visible
    const tabSession = activeTabSessions.get(tabId);
    const isVisible = tabSession?.isVisible ?? true; // Default to true if not set
    
    const now = Date.now();
    const timeElapsed = Math.floor((now - session.startTime) / 1000); // in seconds
    
    // Only count time if video is playing, tab is visible, and user is actively viewing
    if (!isPlaying || !isVisible) {
      if (!isEnding) {
        console.log(`Not counting time for tab ${tabId}: playing=${isPlaying}, visible=${isVisible}`);
        return;
      }
    }
    
    // Update session
    const updatedSession = {
      ...session,
      watchTime: timeElapsed,
      endTime: isEnding ? now : undefined
    };
    
    await updateActiveSession(tabId, updatedSession);
    
    // Calculate incremental time since last update
    const lastUpdateTime = activeTabSessions.get(tabId)?.lastUpdateTime || session.startTime;
    const incrementalTime = Math.floor((now - lastUpdateTime) / 1000);
    
    if (incrementalTime > 0) {
      console.log(`Adding ${incrementalTime} seconds of ${session.isStudyRelated ? 'study' : 'fun'} time for tab ${tabId}`);
      await addTime(session.isStudyRelated, incrementalTime);
      
      // Update last update time
      if (tabSession) {
        tabSession.lastUpdateTime = now;
        activeTabSessions.set(tabId, tabSession);
      }
    }
    
    // Check fun time limit for fun videos
    if (!session.isStudyRelated && !isEnding) {
      const isLimitExceeded = await isFunTimeLimitExceeded();
      if (isLimitExceeded) {
        console.log('Fun time limit exceeded during session, blocking video');
        await blockVideo(tabId, 'You\'ve reached your fun time limit for today!');
        await stopTimeTracking(tabId);
      }
    }
    
    // If session is ending, move to history
    if (isEnding && timeElapsed > 10) { // Minimum 10 seconds to count
      console.log(`Ending session for tab ${tabId} with ${timeElapsed} seconds watched`);
      await addSessionToHistory(updatedSession);
      await removeActiveSession(tabId);
      activeTabSessions.delete(tabId);
    }
    
  } catch (error) {
    console.error('Error updating session time:', error);
  }
}

/**
 * Block a video by injecting blocking overlay
 */
async function blockVideo(tabId, message) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'BLOCK_VIDEO',
      data: { message }
    });
    
    // Update tab session
    const tabSession = activeTabSessions.get(tabId);
    if (tabSession) {
      tabSession.isBlocked = true;
      activeTabSessions.set(tabId, tabSession);
    }
    
    // Stop time tracking
    await stopTimeTracking(tabId);
    
    console.log(`Blocked video in tab ${tabId}: ${message}`);
    
  } catch (error) {
    console.error('Error blocking video:', error);
  }
}

/**
 * Handle user classification response
 */
async function handleClassificationResponse(message, sender) {
  if (!sender.tab?.id || !message.data) return;
  
  const tabId = sender.tab.id;
  const { isStudy, videoInfo } = message.data;
  
  console.log(`User classified video as ${isStudy ? 'study' : 'fun'}: ${videoInfo?.title}`);
  
  // Check fun time limit if classified as fun
  if (!isStudy) {
    const isLimitExceeded = await isFunTimeLimitExceeded();
    if (isLimitExceeded) {
      await blockVideo(tabId, 'You\'ve reached your fun time limit for today!');
      return;
    }
  }
  
  // Start session
  const tabSession = activeTabSessions.get(tabId);
  if (tabSession) {
    await startVideoSession(tabId, tabSession.videoId, tabSession.url, videoInfo, isStudy);
    tabSession.classification = isStudy ? 'study' : 'fun';
    activeTabSessions.set(tabId, tabSession);
  }
}

/**
 * Handle tab removal
 */
async function handleTabRemoved(tabId) {
  console.log(`Tab ${tabId} removed`);
  
  try {
    await stopTimeTracking(tabId);
    activeTabSessions.delete(tabId);
    
    // Clean up session data
    const session = await removeActiveSession(tabId);
    if (session && session.watchTime > 10) {
      await addSessionToHistory({
        ...session,
        endTime: Date.now()
      });
    }
  } catch (error) {
    console.error('Error handling tab removal:', error);
  }
}

/**
 * Handle tab updates (URL changes, etc.)
 */
async function handleTabUpdated(tabId, changeInfo, tab) {
  // Only handle complete URL changes to YouTube videos
  if (changeInfo.status === 'complete' && tab.url) {
    const videoId = extractVideoId(tab.url);
    const currentSession = activeTabSessions.get(tabId);
    
    // If this is a new video in the same tab, treat it as a new session
    if (videoId && currentSession && currentSession.videoId !== videoId) {
      console.log(`Video changed in tab ${tabId}: ${currentSession.videoId} -> ${videoId}`);
      await stopTimeTracking(tabId);
      activeTabSessions.delete(tabId);
      
      // The content script will detect the new video and send VIDEO_DETECTED message
    }
    // If user navigated away from YouTube, stop tracking
    else if (!videoId && currentSession) {
      console.log(`User navigated away from YouTube in tab ${tabId}`);
      await stopTimeTracking(tabId);
      activeTabSessions.delete(tabId);
    }
  }
}

// Event listeners
chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Service worker received message:', message.type, message.data);
  
  // Handle async responses properly
  if (message.type === 'GET_SETTINGS') {
    getSettings().then(settings => {
      console.log('Sending settings:', settings);
      sendResponse(settings);
    }).catch(error => {
      console.error('Error getting settings:', error);
      sendResponse({ error: error.message });
    });
    return true;
  }
  
  if (message.type === 'GET_STATS') {
    Promise.all([
      getTimeStats(),
      getRemainingFunTime()
    ]).then(([stats, remaining]) => {
      console.log('Sending stats:', { stats, remainingFunTime: remaining });
      sendResponse({ stats, remainingFunTime: remaining });
    }).catch(error => {
      console.error('Error getting stats:', error);
      sendResponse({ error: error.message });
    });
    return true;
  }
  
  if (message.type === 'UPDATE_SETTINGS') {
    updateSettings(message.data).then(() => {
      console.log('Settings updated successfully');
      sendResponse({ success: true });
    }).catch(error => {
      console.error('Error updating settings:', error);
      sendResponse({ error: error.message });
    });
    return true;
  }
  
  if (message.type === 'INIT_CHECK') {
    getSettings().then(currentSettings => {
      const response = { 
        isFirstTime: currentSettings.isFirstTime,
        hasStudyArea: !!currentSettings.studyArea 
      };
      console.log('Sending init check:', response);
      sendResponse(response);
    }).catch(error => {
      console.error('Error in init check:', error);
      sendResponse({ error: error.message });
    });
    return true;
  }
  
  if (message.type === 'RESET_DATA') {
    resetAllData().then(() => {
      console.log('Data reset successfully');
      sendResponse({ success: true });
    }).catch(error => {
      console.error('Error resetting data:', error);
      sendResponse({ error: error.message });
    });
    return true;
  }
  
  // Handle non-response messages
  (async () => {
    try {
      switch (message.type) {
        case 'VIDEO_DETECTED':
          await handleVideoDetected(message, sender);
          break;
          
        case 'CLASSIFICATION_RESPONSE':
          await handleClassificationResponse(message, sender);
          break;
          
        case 'VIDEO_ENDED':
          if (sender.tab?.id) {
            await stopTimeTracking(sender.tab.id);
          }
          break;
          
        case 'VISIBILITY_CHANGE':
          await handleVisibilityChange(message, sender);
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  })();
  
  return false; // No async response for these messages
});

// Tab event listeners
chrome.tabs.onRemoved.addListener(handleTabRemoved);
chrome.tabs.onUpdated.addListener(handleTabUpdated);

// Handle browser/extension shutdown
chrome.runtime.onSuspend.addListener(async () => {
  console.log('Extension suspending, saving all active sessions...');
  
  // Save all active sessions
  for (const [tabId] of activeTabSessions.entries()) {
    try {
      await updateSessionTime(tabId, true);
    } catch (error) {
      console.error(`Error saving session for tab ${tabId}:`, error);
    }
  }
});

console.log('YouTube Study Tracker Service Worker Loaded');