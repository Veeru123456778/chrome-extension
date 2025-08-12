// Service Worker for YouTube Study Time Tracker Extension

import { 
  initializeStorage, 
  getSettings, 
  updateSettings,
  getActiveSessions,
  updateActiveSession,
  removeActiveSession,
  addTime,
  isFunTimeLimitExceeded,
  getRemainingFunTime,
  addSessionToHistory,
  type VideoSession
} from './utils/storage.js';

import { 
  extractVideoId, 
  classifyVideo,
  type YouTubeVideoInfo 
} from './utils/youtube-api.js';

// Message types for communication between service worker and content scripts
export interface Message {
  type: 'VIDEO_DETECTED' | 'TIME_UPDATE' | 'VIDEO_ENDED' | 'TAB_CLOSED' | 
        'CLASSIFICATION_REQUEST' | 'CLASSIFICATION_RESPONSE' | 'BLOCK_VIDEO' | 
        'GET_SETTINGS' | 'UPDATE_SETTINGS' | 'GET_STATS' | 'INIT_CHECK' | 'VISIBILITY_CHANGE';
  data?: any;
  tabId?: number;
  videoId?: string;
}

interface TabSession {
  tabId: number;
  videoId: string;
  url: string;
  isBlocked: boolean;
  startTime: number;
  lastUpdateTime: number;
  classification: 'study' | 'fun' | 'unknown';
  isVisible: boolean;
}

// Track active sessions in memory for quick access
const activeTabSessions = new Map<number, TabSession>();

// Track intervals for each tab
const timeTrackingIntervals = new Map<number, number>();

console.log('YouTube Study Tracker Service Worker Starting...');

/**
 * Initialize the extension on startup
 */
async function initialize(): Promise<void> {
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
async function cleanupStaleSessions(): Promise<void> {
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
async function handleVideoDetected(message: Message, sender: chrome.runtime.MessageSender): Promise<void> {
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
    
    let videoClassification: 'study' | 'fun' | 'unknown' = 'unknown';
    
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
async function startVideoSession(
  tabId: number, 
  videoId: string, 
  url: string, 
  videoInfo: YouTubeVideoInfo | null, 
  isStudy: boolean
): Promise<void> {
  try {
    const session: VideoSession = {
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
async function startTimeTracking(tabId: number): Promise<void> {
  // Clear any existing interval
  if (timeTrackingIntervals.has(tabId)) {
    clearInterval(timeTrackingIntervals.get(tabId)!);
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
  }, 5000) as unknown as number;
  
  timeTrackingIntervals.set(tabId, interval);
  console.log(`Started time tracking for tab ${tabId}`);
}

/**
 * Stop time tracking for a tab
 */
async function stopTimeTracking(tabId: number): Promise<void> {
  if (timeTrackingIntervals.has(tabId)) {
    clearInterval(timeTrackingIntervals.get(tabId)!);
    timeTrackingIntervals.delete(tabId);
    console.log(`Stopped time tracking for tab ${tabId}`);
  }
  
  // Final time update
  await updateSessionTime(tabId, true);
}

/**
 * Handle visibility change from content script
 */
async function handleVisibilityChange(message: Message, sender: chrome.runtime.MessageSender): Promise<void> {
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
async function updateSessionTime(tabId: number, isEnding: boolean = false): Promise<void> {
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
    const updatedSession: VideoSession = {
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
async function blockVideo(tabId: number, message: string): Promise<void> {
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
async function handleClassificationResponse(message: Message, sender: chrome.runtime.MessageSender): Promise<void> {
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
async function handleTabRemoved(tabId: number): Promise<void> {
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
async function handleTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): Promise<void> {
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
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  console.log('Service worker received message:', message.type, message.data);
  
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
          
        case 'GET_SETTINGS':
          const settings = await getSettings();
          sendResponse(settings);
          break;
          
        case 'UPDATE_SETTINGS':
          await updateSettings(message.data);
          sendResponse({ success: true });
          break;
          
        case 'GET_STATS':
          const { getTimeStats } = await import('./utils/storage.js');
          const stats = await getTimeStats();
          const remaining = await getRemainingFunTime();
          sendResponse({ stats, remainingFunTime: remaining });
          break;
          
        case 'INIT_CHECK':
          const currentSettings = await getSettings();
          sendResponse({ 
            isFirstTime: currentSettings.isFirstTime,
            hasStudyArea: !!currentSettings.studyArea 
          });
          break;
          
        case 'VISIBILITY_CHANGE':
          await handleVisibilityChange(message, sender);
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
      }
          } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({ error: (error as Error).message });
      }
  })();
  
  return true; // Keep message channel open for async response
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