// Storage utility functions for Chrome Extension

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

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'settings',
  TIME_STATS: 'timeStats',
  ACTIVE_SESSIONS: 'activeSessions',
  SESSION_HISTORY: 'sessionHistory'
};

/**
 * Initialize storage with default values if not exists
 */
export async function initializeStorage() {
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

/**
 * Get user settings
 */
export async function getSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    return result.settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update user settings
 */
export async function updateSettings(updates) {
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

/**
 * Get time statistics
 */
export async function getTimeStats() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.TIME_STATS);
    return result.timeStats || DEFAULT_TIME_STATS;
  } catch (error) {
    console.error('Error getting time stats:', error);
    return DEFAULT_TIME_STATS;
  }
}

/**
 * Add time to study or fun time
 */
export async function addTime(isStudy, seconds) {
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

/**
 * Get active sessions
 */
export async function getActiveSessions() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_SESSIONS);
    return result.activeSessions || {};
  } catch (error) {
    console.error('Error getting active sessions:', error);
    return {};
  }
}

/**
 * Update active session
 */
export async function updateActiveSession(tabId, session) {
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

/**
 * Remove active session
 */
export async function removeActiveSession(tabId) {
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

/**
 * Add session to history
 */
export async function addSessionToHistory(session) {
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

/**
 * Get session history
 */
export async function getSessionHistory() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SESSION_HISTORY);
    return result.sessionHistory || [];
  } catch (error) {
    console.error('Error getting session history:', error);
    return [];
  }
}

/**
 * Check if fun time limit is exceeded
 */
export async function isFunTimeLimitExceeded() {
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

/**
 * Get remaining fun time
 */
export async function getRemainingFunTime() {
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

/**
 * Reset all data (for testing/debugging)
 */
export async function resetAllData() {
  try {
    await chrome.storage.local.clear();
    await initializeStorage();
    console.log('All data reset successfully');
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
}

/**
 * Export data for backup
 */
export async function exportData() {
  try {
    const data = await chrome.storage.local.get(null);
    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

/**
 * Import data from backup
 */
export async function importData(data) {
  try {
    await chrome.storage.local.clear();
    await chrome.storage.local.set(data);
    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
}