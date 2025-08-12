// Storage utility functions for Chrome Extension

export interface StudyArea {
  id: string;
  name: string;
}

export interface VideoSession {
  videoId: string;
  title: string;
  category: string;
  categoryId: number;
  isStudyRelated: boolean;
  startTime: number;
  endTime?: number;
  watchTime: number; // in seconds
  tabId: number;
  url: string;
}

export interface TimeStats {
  totalStudyTime: number; // in seconds
  totalFunTime: number; // in seconds
  dailyStudyTime: number;
  dailyFunTime: number;
  lastResetDate: string; // ISO date string
}

export interface Settings {
  studyArea: StudyArea | null;
  funTimeLimit: number; // minutes of fun per hour of study (default: 20)
  isFirstTime: boolean;
  youtubeApiKey?: string;
  notifications: boolean;
}

export interface ExtensionData {
  settings: Settings;
  timeStats: TimeStats;
  activeSessions: { [tabId: string]: VideoSession };
  sessionHistory: VideoSession[];
}

const DEFAULT_SETTINGS: Settings = {
  studyArea: null,
  funTimeLimit: 20,
  isFirstTime: true,
  notifications: true
};

const DEFAULT_TIME_STATS: TimeStats = {
  totalStudyTime: 0,
  totalFunTime: 0,
  dailyStudyTime: 0,
  dailyFunTime: 0,
  lastResetDate: new Date().toISOString().split('T')[0]
};

// Removed unused DEFAULT_DATA constant

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'settings',
  TIME_STATS: 'timeStats',
  ACTIVE_SESSIONS: 'activeSessions',
  SESSION_HISTORY: 'sessionHistory'
} as const;

/**
 * Initialize storage with default values if not exists
 */
export async function initializeStorage(): Promise<void> {
  try {
    const keys = [STORAGE_KEYS.SETTINGS, STORAGE_KEYS.TIME_STATS, STORAGE_KEYS.ACTIVE_SESSIONS, STORAGE_KEYS.SESSION_HISTORY];
    const result = await chrome.storage.local.get(keys);
    
    const updates: Partial<ExtensionData> = {};
    
    if (!result.settings) {
      updates.settings = DEFAULT_SETTINGS;
    }
    
    if (!result.timeStats) {
      updates.timeStats = DEFAULT_TIME_STATS;
    } else {
      // Check if we need to reset daily stats
      const timeStats = result.timeStats as TimeStats;
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
    
    if (Object.keys(updates).length > 0) {
      await chrome.storage.local.set(updates);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

/**
 * Get settings from storage
 */
export async function getSettings(): Promise<Settings> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    return result.settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update settings in storage
 */
export async function updateSettings(updates: Partial<Settings>): Promise<void> {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...updates };
    await chrome.storage.local.set({ settings: newSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
  }
}

/**
 * Get time statistics from storage
 */
export async function getTimeStats(): Promise<TimeStats> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.TIME_STATS);
    return result.timeStats || DEFAULT_TIME_STATS;
  } catch (error) {
    console.error('Error getting time stats:', error);
    return DEFAULT_TIME_STATS;
  }
}

/**
 * Update time statistics in storage
 */
export async function updateTimeStats(updates: Partial<TimeStats>): Promise<void> {
  try {
    const currentStats = await getTimeStats();
    const newStats = { ...currentStats, ...updates };
    await chrome.storage.local.set({ timeStats: newStats });
  } catch (error) {
    console.error('Error updating time stats:', error);
  }
}

/**
 * Add time to study or fun category
 */
export async function addTime(isStudy: boolean, timeInSeconds: number): Promise<void> {
  try {
    const currentStats = await getTimeStats();
    const today = new Date().toISOString().split('T')[0];
    
    // Reset daily stats if new day
    if (currentStats.lastResetDate !== today) {
      currentStats.dailyStudyTime = 0;
      currentStats.dailyFunTime = 0;
      currentStats.lastResetDate = today;
    }
    
    const updates: Partial<TimeStats> = {
      lastResetDate: today
    };
    
    if (isStudy) {
      updates.totalStudyTime = currentStats.totalStudyTime + timeInSeconds;
      updates.dailyStudyTime = currentStats.dailyStudyTime + timeInSeconds;
    } else {
      updates.totalFunTime = currentStats.totalFunTime + timeInSeconds;
      updates.dailyFunTime = currentStats.dailyFunTime + timeInSeconds;
    }
    
    await updateTimeStats({ ...currentStats, ...updates });
  } catch (error) {
    console.error('Error adding time:', error);
  }
}

/**
 * Get active sessions from storage
 */
export async function getActiveSessions(): Promise<{ [tabId: string]: VideoSession }> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_SESSIONS);
    return result.activeSessions || {};
  } catch (error) {
    console.error('Error getting active sessions:', error);
    return {};
  }
}

/**
 * Update active session for a tab
 */
export async function updateActiveSession(tabId: number, session: VideoSession): Promise<void> {
  try {
    const activeSessions = await getActiveSessions();
    activeSessions[tabId.toString()] = session;
    await chrome.storage.local.set({ activeSessions: activeSessions });
  } catch (error) {
    console.error('Error updating active session:', error);
  }
}

/**
 * Remove active session for a tab
 */
export async function removeActiveSession(tabId: number): Promise<VideoSession | null> {
  try {
    const activeSessions = await getActiveSessions();
    const session = activeSessions[tabId.toString()] || null;
    delete activeSessions[tabId.toString()];
    await chrome.storage.local.set({ activeSessions: activeSessions });
    return session;
  } catch (error) {
    console.error('Error removing active session:', error);
    return null;
  }
}

/**
 * Get session history from storage
 */
export async function getSessionHistory(): Promise<VideoSession[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SESSION_HISTORY);
    return result.sessionHistory || [];
  } catch (error) {
    console.error('Error getting session history:', error);
    return [];
  }
}

/**
 * Add session to history
 */
export async function addSessionToHistory(session: VideoSession): Promise<void> {
  try {
    const history = await getSessionHistory();
    // Keep only last 100 sessions to prevent excessive storage usage
    const updatedHistory = [...history, session].slice(-100);
    await chrome.storage.local.set({ sessionHistory: updatedHistory });
  } catch (error) {
    console.error('Error adding session to history:', error);
  }
}

/**
 * Calculate productivity percentage
 */
export function calculateProductivity(studyTime: number, funTime: number): number {
  const totalTime = studyTime + funTime;
  if (totalTime === 0) return 100; // Default to 100% if no time tracked
  return Math.round((studyTime / totalTime) * 100);
}

/**
 * Check if fun time limit is exceeded
 */
export async function isFunTimeLimitExceeded(): Promise<boolean> {
  try {
    const stats = await getTimeStats();
    const settings = await getSettings();
    
    // Calculate allowed fun time based on study time
    const studyTimeInMinutes = stats.dailyStudyTime / 60;
    const allowedFunTimeInMinutes = (studyTimeInMinutes / 60) * settings.funTimeLimit;
    const actualFunTimeInMinutes = stats.dailyFunTime / 60;
    
    return actualFunTimeInMinutes > allowedFunTimeInMinutes;
  } catch (error) {
    console.error('Error checking fun time limit:', error);
    return false;
  }
}

/**
 * Get remaining fun time in minutes
 */
export async function getRemainingFunTime(): Promise<number> {
  try {
    const stats = await getTimeStats();
    const settings = await getSettings();
    
    const studyTimeInHours = stats.dailyStudyTime / 3600;
    const allowedFunTimeInMinutes = studyTimeInHours * settings.funTimeLimit;
    const actualFunTimeInMinutes = stats.dailyFunTime / 60;
    
    return Math.max(0, allowedFunTimeInMinutes - actualFunTimeInMinutes);
  } catch (error) {
    console.error('Error getting remaining fun time:', error);
    return 0;
  }
}