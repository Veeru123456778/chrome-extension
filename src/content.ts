// Content Script for YouTube Study Time Tracker Extension

import { extractVideoId } from './utils/youtube-api.js';

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isPaused: boolean;
  isMuted: boolean;
}

interface VideoBlockingOverlay {
  element: HTMLElement;
  isActive: boolean;
}

class YouTubeTracker {
  private currentVideoId: string | null = null;
  private currentUrl: string = '';
  private videoElement: HTMLVideoElement | null = null;
  private blockingOverlay: VideoBlockingOverlay | null = null;
  private observer: MutationObserver | null = null;
  private playbackCheckInterval: number | null = null;
  private isBlocked: boolean = false;
  private classificationDialog: HTMLElement | null = null;
  private setupDialog: HTMLElement | null = null;
  
  constructor() {
    console.log('YouTube Study Tracker Content Script Starting...');
    this.init();
  }
  
  private async init(): Promise<void> {
    try {
      // Wait for page to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.startTracking());
      } else {
        await this.startTracking();
      }
      
      // Listen for URL changes (YouTube is a SPA)
      this.setupUrlChangeListener();
      
      // Setup message listener
      this.setupMessageListener();
      
    } catch (error) {
      console.error('Error initializing YouTube tracker:', error);
    }
  }
  
  private async startTracking(): Promise<void> {
    try {
      // Check if this is a video page
      if (this.isVideoPage()) {
        await this.handleVideoPageLoad();
      }
      
      // Setup mutation observer to detect dynamic content changes
      this.setupMutationObserver();
      
    } catch (error) {
      console.error('Error starting tracking:', error);
    }
  }
  
  private isVideoPage(): boolean {
    return window.location.pathname === '/watch' && !!this.getVideoIdFromUrl();
  }
  
  private getVideoIdFromUrl(): string | null {
    return extractVideoId(window.location.href);
  }
  
  private async handleVideoPageLoad(): Promise<void> {
    const videoId = this.getVideoIdFromUrl();
    const url = window.location.href;
    
    if (!videoId || (videoId === this.currentVideoId && url === this.currentUrl)) {
      return; // Same video, no need to reprocess
    }
    
    console.log('New video detected:', videoId);
    
    this.currentVideoId = videoId;
    this.currentUrl = url;
    this.isBlocked = false;
    
    // Remove any existing blocking overlay
    this.removeBlockingOverlay();
    
    // Find video element
    await this.findVideoElement();
    
    // Notify service worker about new video
    await this.notifyVideoDetected(videoId, url);
    
    // Start playback monitoring
    this.startPlaybackMonitoring();
  }
  
  private async findVideoElement(): Promise<void> {
    // Try multiple selectors for YouTube video element
    const selectors = [
      'video.html5-main-video',
      'video.video-stream',
      'video[src]',
      '.html5-video-container video',
      '#movie_player video'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLVideoElement;
      if (element) {
        this.videoElement = element;
        console.log('Found video element:', selector);
        
        // Setup video event listeners
        this.setupVideoEventListeners();
        return;
      }
    }
    
    // If not found immediately, wait and try again
    setTimeout(() => this.findVideoElement(), 1000);
  }
  
  private setupVideoEventListeners(): void {
    if (!this.videoElement) return;
    
    const video = this.videoElement;
    
    // Video events
    video.addEventListener('play', () => {
      console.log('Video play event');
      if (this.isBlocked) {
        this.blockPlayback();
      }
    });
    
    video.addEventListener('pause', () => {
      console.log('Video pause event');
    });
    
    video.addEventListener('ended', () => {
      console.log('Video ended');
      this.notifyVideoEnded();
    });
    
    video.addEventListener('timeupdate', () => {
      if (this.isBlocked) {
        this.blockPlayback();
      }
    });
    
    // Prevent seeking when blocked
    video.addEventListener('seeking', () => {
      if (this.isBlocked) {
        video.currentTime = 0;
      }
    });
  }
  
  private startPlaybackMonitoring(): void {
    // Clear existing interval
    if (this.playbackCheckInterval) {
      clearInterval(this.playbackCheckInterval);
    }
    
    // Check playback state every 2 seconds
    this.playbackCheckInterval = window.setInterval(() => {
      if (this.isBlocked) {
        this.blockPlayback();
      }
    }, 2000);
  }
  
  private setupUrlChangeListener(): void {
    // Listen for pushstate/popstate events (YouTube navigation)
    let lastUrl = window.location.href;
    
    const checkUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('URL changed to:', currentUrl);
        
        // Small delay to let YouTube load the new page
        setTimeout(() => {
          if (this.isVideoPage()) {
            this.handleVideoPageLoad();
          } else {
            this.cleanup();
          }
        }, 500);
      }
    };
    
    // Override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      checkUrlChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      checkUrlChange();
    };
    
    // Listen for popstate (back/forward)
    window.addEventListener('popstate', checkUrlChange);
    
    // Also check periodically in case YouTube updates URL without triggering events
    setInterval(checkUrlChange, 1000);
  }
  
  private setupMutationObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.observer = new MutationObserver((mutations) => {
      // Check if video element was added/changed
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof Element) {
              // Check if a video element was added
              const videoElement = node.querySelector?.('video.html5-main-video') as HTMLVideoElement;
              if (videoElement && videoElement !== this.videoElement) {
                console.log('New video element detected via mutation observer');
                this.videoElement = videoElement;
                this.setupVideoEventListeners();
              }
            }
          }
        }
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      console.log('Content script received message:', message.type);
      
      (async () => {
        try {
          switch (message.type) {
            case 'GET_PLAYBACK_STATE':
              const state = this.getPlaybackState();
              sendResponse(state);
              break;
              
            case 'BLOCK_VIDEO':
              await this.showBlockingOverlay(message.data.message);
              sendResponse({ success: true });
              break;
              
            case 'REQUEST_CLASSIFICATION':
              await this.showClassificationDialog(message.data);
              sendResponse({ success: true });
              break;
              
            case 'SESSION_STARTED':
              console.log('Session started:', message.data);
              await this.showSessionIndicator(message.data);
              sendResponse({ success: true });
              break;
              
            case 'SHOW_SETUP':
              await this.showSetupDialog(message.data);
              sendResponse({ success: true });
              break;
              
            default:
              console.warn('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error handling message:', error);
          sendResponse({ error: (error as Error).message });
        }
      })();
      
      return true; // Keep message channel open
    });
  }
  
  private getPlaybackState(): PlaybackState {
    if (!this.videoElement) {
      return {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        isPaused: true,
        isMuted: false
      };
    }
    
    const video = this.videoElement;
    return {
      isPlaying: !video.paused && !video.ended && video.currentTime > 0,
      currentTime: video.currentTime,
      duration: video.duration || 0,
      isPaused: video.paused,
      isMuted: video.muted
    };
  }
  
  private async notifyVideoDetected(videoId: string, url: string): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: 'VIDEO_DETECTED',
        data: { videoId, url }
      });
    } catch (error) {
      console.error('Error notifying video detected:', error);
    }
  }
  
  private async notifyVideoEnded(): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: 'VIDEO_ENDED',
        videoId: this.currentVideoId
      });
    } catch (error) {
      console.error('Error notifying video ended:', error);
    }
  }
  
  private async showBlockingOverlay(message: string): Promise<void> {
    this.isBlocked = true;
    this.blockPlayback();
    
    if (this.blockingOverlay?.isActive) {
      return; // Already showing
    }
    
    // Create blocking overlay
    const overlay = document.createElement('div');
    overlay.id = 'youtube-study-tracker-block';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Roboto', Arial, sans-serif;
      color: white;
      backdrop-filter: blur(10px);
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      text-align: center;
      padding: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      max-width: 500px;
      margin: 0 20px;
    `;
    
    content.innerHTML = `
      <div style="font-size: 60px; margin-bottom: 20px;">⏰</div>
      <h2 style="font-size: 32px; margin-bottom: 20px; color: #ff6b6b;">Video Blocked</h2>
      <p style="font-size: 18px; margin-bottom: 30px; line-height: 1.5;">${message}</p>
      <p style="font-size: 16px; opacity: 0.8; margin-bottom: 30px;">
        Study more to unlock additional fun time!
      </p>
      <button id="close-tab-btn" style="
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 16px;
        cursor: pointer;
        margin-right: 10px;
        transition: background 0.3s;
      ">Close Tab</button>
      <button id="open-popup-btn" style="
        background: #4ecdc4;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.3s;
      ">View Stats</button>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Add event listeners
    const closeBtn = content.querySelector('#close-tab-btn');
    const popupBtn = content.querySelector('#open-popup-btn');
    
    closeBtn?.addEventListener('click', () => {
      window.close();
    });
    
    popupBtn?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    });
    
    this.blockingOverlay = { element: overlay, isActive: true };
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
  }
  
  private removeBlockingOverlay(): void {
    if (this.blockingOverlay?.element) {
      this.blockingOverlay.element.remove();
      this.blockingOverlay = null;
      document.body.style.overflow = '';
    }
    this.isBlocked = false;
  }
  
  private blockPlayback(): void {
    if (!this.videoElement || !this.isBlocked) return;
    
    const video = this.videoElement;
    
    // Pause the video
    if (!video.paused) {
      video.pause();
    }
    
    // Reset to beginning
    if (video.currentTime > 0) {
      video.currentTime = 0;
    }
    
    // Prevent keyboard controls
    this.blockKeyboardControls();
  }
  
  private blockKeyboardControls(): void {
    const blockKeydown = (e: KeyboardEvent) => {
      if (this.isBlocked) {
        // Block common YouTube shortcuts
        const blockedKeys = [' ', 'ArrowRight', 'ArrowLeft', 'k', 'j', 'l', 'm', 'f'];
        if (blockedKeys.indexOf(e.key) !== -1) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };
    
    document.addEventListener('keydown', blockKeydown, true);
  }
  
  private async showClassificationDialog(data: any): Promise<void> {
    if (this.classificationDialog) {
      this.classificationDialog.remove();
    }
    
    const { videoInfo, isEducationalCategory, isRelatedToStudyArea, studyArea } = data;
    
    const dialog = document.createElement('div');
    dialog.id = 'youtube-study-tracker-classification';
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      font-family: 'Roboto', Arial, sans-serif;
      max-width: 500px;
      min-width: 400px;
      text-align: center;
      border: 3px solid #4ecdc4;
    `;
    
    const indicators = [];
    if (isEducationalCategory) indicators.push('📚 Educational Category');
    if (isRelatedToStudyArea) indicators.push(`🎯 Related to ${studyArea}`);
    
    dialog.innerHTML = `
      <h3 style="color: #333; margin-bottom: 20px; font-size: 24px;">📊 Classify This Video</h3>
      <div style="margin-bottom: 20px; text-align: left;">
        <h4 style="color: #333; margin-bottom: 10px;">📺 ${videoInfo?.title || 'Unknown Video'}</h4>
        <p style="color: #666; margin-bottom: 15px;">👤 ${videoInfo?.channelTitle || 'Unknown Channel'}</p>
        ${indicators.length > 0 ? `
          <div style="background: #f0f8f0; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
            <strong style="color: #2d8f47;">Detected Indicators:</strong><br>
            ${indicators.map(ind => `<span style="color: #2d8f47;">• ${ind}</span>`).join('<br>')}
          </div>
        ` : ''}
        <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
          <strong>Is this video related to your ${studyArea} studies?</strong>
        </p>
      </div>
      <div style="display: flex; gap: 15px; justify-content: center;">
        <button id="classify-study" style="
          background: #4ecdc4;
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          flex: 1;
          transition: background 0.3s;
        ">📚 Study Time</button>
        <button id="classify-fun" style="
          background: #ff6b6b;
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          flex: 1;
          transition: background 0.3s;
        ">🎉 Fun Time</button>
      </div>
      <p style="color: #888; font-size: 12px; margin-top: 15px;">
        This helps track your study vs fun time accurately
      </p>
    `;
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999998;
    `;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(dialog);
    
    // Add event listeners
    const studyBtn = dialog.querySelector('#classify-study');
    const funBtn = dialog.querySelector('#classify-fun');
    
    const sendClassification = async (isStudy: boolean) => {
      try {
        await chrome.runtime.sendMessage({
          type: 'CLASSIFICATION_RESPONSE',
          data: { isStudy, videoInfo }
        });
        
        backdrop.remove();
        dialog.remove();
        this.classificationDialog = null;
      } catch (error) {
        console.error('Error sending classification:', error);
      }
    };
    
    studyBtn?.addEventListener('click', () => sendClassification(true));
    funBtn?.addEventListener('click', () => sendClassification(false));
    
    this.classificationDialog = dialog;
  }
  
  private async showSessionIndicator(data: any): Promise<void> {
    const { isStudy } = data;
    
    // Create session indicator
    const indicator = document.createElement('div');
    indicator.id = 'youtube-study-tracker-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isStudy ? '#4ecdc4' : '#ff6b6b'};
      color: white;
      padding: 10px 15px;
      border-radius: 25px;
      z-index: 999999;
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      cursor: pointer;
    `;
    
    indicator.innerHTML = `
      ${isStudy ? '📚' : '🎉'} ${isStudy ? 'Study' : 'Fun'} Time
    `;
    
    document.body.appendChild(indicator);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
      }
    }, 5000);
    
    // Click to show stats
    indicator.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    });
  }
  
  private async showSetupDialog(_data: any): Promise<void> {
    if (this.setupDialog) {
      this.setupDialog.remove();
    }
    
    const dialog = document.createElement('div');
    dialog.id = 'youtube-study-tracker-setup';
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      font-family: 'Roboto', Arial, sans-serif;
      max-width: 600px;
      min-width: 500px;
      text-align: center;
      border: 3px solid #4ecdc4;
    `;
    
    dialog.innerHTML = `
      <h2 style="color: #333; margin-bottom: 20px; font-size: 28px;">🎓 Welcome to YouTube Study Tracker!</h2>
      <p style="color: #666; margin-bottom: 30px; font-size: 16px; line-height: 1.5;">
        Let's set up your study area to accurately track your learning vs fun time.
      </p>
      <div style="margin-bottom: 30px; text-align: left;">
        <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #333;">
          📚 What's your main study area?
        </label>
        <select id="study-area-select" style="
          width: 100%;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 10px;
          font-size: 16px;
          background: white;
          margin-bottom: 20px;
        ">
          <option value="">Select your study area...</option>
          <option value="Computer Science">💻 Computer Science</option>
          <option value="Medical">🩺 Medical / Healthcare</option>
          <option value="Law">⚖️ Law</option>
          <option value="Business">💼 Business</option>
          <option value="Engineering">🔧 Engineering</option>
          <option value="Mathematics">🔢 Mathematics</option>
          <option value="Physics">⚛️ Physics</option>
          <option value="Chemistry">🧪 Chemistry</option>
          <option value="Biology">🧬 Biology</option>
          <option value="Psychology">🧠 Psychology</option>
          <option value="History">📜 History</option>
          <option value="Literature">📖 Literature</option>
          <option value="Art">🎨 Art</option>
          <option value="Music">🎵 Music</option>
          <option value="Other">📝 Other</option>
        </select>
        <input id="custom-study-area" type="text" placeholder="Enter custom study area..." style="
          width: 100%;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 10px;
          font-size: 16px;
          display: none;
        ">
      </div>
      <div style="margin-bottom: 30px; text-align: left;">
        <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #333;">
          ⏰ Fun time limit per hour of study (default: 20 minutes)
        </label>
        <input id="fun-time-limit" type="range" min="5" max="30" value="20" style="
          width: 100%;
          margin-bottom: 10px;
        ">
        <div style="display: flex; justify-content: space-between; color: #666; font-size: 14px;">
          <span>5 min</span>
          <span id="limit-display">20 minutes</span>
          <span>30 min</span>
        </div>
      </div>
      <button id="save-setup" style="
        background: #4ecdc4;
        color: white;
        border: none;
        padding: 15px 40px;
        border-radius: 10px;
        font-size: 18px;
        cursor: pointer;
        width: 100%;
        transition: background 0.3s;
      " disabled>Save Settings</button>
    `;
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999998;
    `;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(dialog);
    
    // Setup event listeners
    const studyAreaSelect = dialog.querySelector('#study-area-select') as HTMLSelectElement;
    const customInput = dialog.querySelector('#custom-study-area') as HTMLInputElement;
    const funTimeLimitSlider = dialog.querySelector('#fun-time-limit') as HTMLInputElement;
    const limitDisplay = dialog.querySelector('#limit-display') as HTMLElement;
    const saveBtn = dialog.querySelector('#save-setup') as HTMLButtonElement;
    
    // Handle study area selection
    studyAreaSelect.addEventListener('change', () => {
      if (studyAreaSelect.value === 'Other') {
        customInput.style.display = 'block';
        customInput.focus();
      } else {
        customInput.style.display = 'none';
      }
      updateSaveButton();
    });
    
    customInput.addEventListener('input', updateSaveButton);
    
    // Handle fun time limit slider
    funTimeLimitSlider.addEventListener('input', () => {
      limitDisplay.textContent = `${funTimeLimitSlider.value} minutes`;
      if (parseInt(funTimeLimitSlider.value) > 25) {
        limitDisplay.style.color = '#ff6b6b';
        limitDisplay.textContent += ' ⚠️';
      } else {
        limitDisplay.style.color = '#666';
      }
    });
    
    function updateSaveButton() {
      const hasValidStudyArea = studyAreaSelect.value && 
        (studyAreaSelect.value !== 'Other' || customInput.value.trim());
      saveBtn.disabled = !hasValidStudyArea;
      saveBtn.style.opacity = hasValidStudyArea ? '1' : '0.5';
    }
    
    // Save settings
    saveBtn.addEventListener('click', async () => {
      try {
        const studyAreaName = studyAreaSelect.value === 'Other' 
          ? customInput.value.trim() 
          : studyAreaSelect.value;
          
        await chrome.runtime.sendMessage({
          type: 'UPDATE_SETTINGS',
          data: {
            studyArea: { id: studyAreaName.toLowerCase(), name: studyAreaName },
            funTimeLimit: parseInt(funTimeLimitSlider.value),
            isFirstTime: false
          }
        });
        
        backdrop.remove();
        dialog.remove();
        this.setupDialog = null;
        
        // Reload the page to restart video detection
        window.location.reload();
        
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    });
    
    this.setupDialog = dialog;
  }
  
  private cleanup(): void {
    this.currentVideoId = null;
    this.currentUrl = '';
    this.videoElement = null;
    this.isBlocked = false;
    
    if (this.playbackCheckInterval) {
      window.clearInterval(this.playbackCheckInterval);
      this.playbackCheckInterval = null;
    }
    
    this.removeBlockingOverlay();
    
    if (this.classificationDialog) {
      this.classificationDialog.remove();
      this.classificationDialog = null;
    }
  }
}

// Initialize the tracker
new YouTubeTracker();