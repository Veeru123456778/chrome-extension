// Content Script for YouTube Study Time Tracker Extension

import { extractVideoId } from './utils/youtube-api.js';

class YouTubeTracker {
  constructor() {
    this.currentVideoId = null;
    this.currentUrl = '';
    this.videoElement = null;
    this.blockingOverlay = null;
    this.observer = null;
    this.playbackCheckInterval = null;
    this.isBlocked = false;
    this.classificationDialog = null;
    this.setupDialog = null;
    this.urlCheckInterval = null;
    
    console.log('YouTube Study Tracker Content Script Starting...');
    this.init();
  }
  
  async init() {
    try {
      // Immediate check for video page
      if (this.isVideoPage()) {
        console.log('Initial video page detected');
        await this.handleVideoPageLoad();
      }
      
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
      
      // Setup visibility change listener
      this.setupVisibilityListener();
      
      // Periodic URL check as backup
      this.startPeriodicUrlCheck();
      
    } catch (error) {
      console.error('Error initializing YouTube tracker:', error);
    }
  }
  
  async startTracking() {
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
  
  isVideoPage() {
    const pathname = window.location.pathname;
    const isWatchPage = pathname === '/watch' || pathname.startsWith('/watch?');
    const hasVideoId = !!this.getVideoIdFromUrl();
    console.log('Checking if video page:', { pathname, isWatchPage, hasVideoId });
    return isWatchPage && hasVideoId;
  }
  
  getVideoIdFromUrl() {
    const videoId = extractVideoId(window.location.href);
    console.log('Extracted video ID from URL:', videoId);
    return videoId;
  }
  
  startPeriodicUrlCheck() {
    // Check URL every 2 seconds as backup
    this.urlCheckInterval = window.setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== this.currentUrl) {
        console.log('URL changed:', this.currentUrl, '->', currentUrl);
        this.currentUrl = currentUrl;
        
        if (this.isVideoPage()) {
          const newVideoId = this.getVideoIdFromUrl();
          if (newVideoId && newVideoId !== this.currentVideoId) {
            console.log('New video detected via URL check:', newVideoId);
            this.handleVideoPageLoad();
          }
        } else {
          // User navigated away from video page
          this.cleanupVideoTracking();
        }
      }
    }, 2000);
  }
  
  setupUrlChangeListener() {
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        if (this.isVideoPage()) {
          const newVideoId = this.getVideoIdFromUrl();
          if (newVideoId && newVideoId !== this.currentVideoId) {
            console.log('New video detected via popstate:', newVideoId);
            this.handleVideoPageLoad();
          }
        } else {
          this.cleanupVideoTracking();
        }
      }, 100);
    });
  }
  
  setupMutationObserver() {
    // Watch for changes in the page content
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Check if video element was added
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const videoElement = node.querySelector('video') || (node.tagName === 'VIDEO' ? node : null);
              if (videoElement && this.isVideoPage()) {
                console.log('Video element detected via mutation observer');
                this.setupVideoTracking(videoElement);
                break;
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
  
  async handleVideoPageLoad() {
    try {
      const videoId = this.getVideoIdFromUrl();
      if (!videoId) {
        console.log('No video ID found in URL');
        return;
      }
      
      if (videoId === this.currentVideoId) {
        console.log('Same video, skipping detection');
        return;
      }
      
      console.log('New video page loaded:', videoId);
      this.currentVideoId = videoId;
      this.currentUrl = window.location.href;
      
      // Wait a bit for the page to fully load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find video element
      const videoElement = document.querySelector('video');
      if (videoElement) {
        this.setupVideoTracking(videoElement);
      } else {
        console.log('Video element not found, will wait for it');
        // The mutation observer will catch it when it's added
      }
      
      // Notify service worker about video detection
      await this.notifyVideoDetected();
      
    } catch (error) {
      console.error('Error handling video page load:', error);
    }
  }
  
  setupVideoTracking(videoElement) {
    if (this.videoElement === videoElement) {
      return; // Already tracking this element
    }
    
    console.log('Setting up video tracking for element:', videoElement);
    this.videoElement = videoElement;
    
    // Start playback monitoring
    this.startPlaybackMonitoring();
    
    // Listen for video events
    videoElement.addEventListener('play', () => this.onVideoPlay());
    videoElement.addEventListener('pause', () => this.onVideoPause());
    videoElement.addEventListener('ended', () => this.onVideoEnded());
    videoElement.addEventListener('timeupdate', () => this.onVideoTimeUpdate());
  }
  
  startPlaybackMonitoring() {
    // Clear existing interval
    if (this.playbackCheckInterval) {
      clearInterval(this.playbackCheckInterval);
    }
    
    // Check playback state every 2 seconds
    this.playbackCheckInterval = setInterval(() => {
      if (this.videoElement) {
        // This will be used by the service worker to check if video is actually playing
        this.updatePlaybackState();
      }
    }, 2000);
  }
  
  updatePlaybackState() {
    if (!this.videoElement) return;
    
    const state = {
      isPlaying: !this.videoElement.paused,
      currentTime: this.videoElement.currentTime,
      duration: this.videoElement.duration,
      isPaused: this.videoElement.paused,
      isMuted: this.videoElement.muted
    };
    
    // Store current state for service worker queries
    this.currentPlaybackState = state;
  }
  
  onVideoPlay() {
    console.log('Video started playing');
    this.updatePlaybackState();
  }
  
  onVideoPause() {
    console.log('Video paused');
    this.updatePlaybackState();
  }
  
  onVideoEnded() {
    console.log('Video ended');
    this.cleanupVideoTracking();
  }
  
  onVideoTimeUpdate() {
    // Update playback state on time updates
    this.updatePlaybackState();
  }
  
  async notifyVideoDetected() {
    try {
      await chrome.runtime.sendMessage({
        type: 'VIDEO_DETECTED',
        data: {
          url: window.location.href,
          videoId: this.currentVideoId
        }
      });
      console.log('Notified service worker about video detection');
    } catch (error) {
      console.error('Error notifying service worker:', error);
    }
  }
  
  cleanupVideoTracking() {
    console.log('Cleaning up video tracking');
    
    if (this.playbackCheckInterval) {
      clearInterval(this.playbackCheckInterval);
      this.playbackCheckInterval = null;
    }
    
    if (this.videoElement) {
      this.videoElement.removeEventListener('play', this.onVideoPlay);
      this.videoElement.removeEventListener('pause', this.onVideoPause);
      this.videoElement.removeEventListener('ended', this.onVideoEnded);
      this.videoElement.removeEventListener('timeupdate', this.onVideoTimeUpdate);
      this.videoElement = null;
    }
    
    this.currentVideoId = null;
    this.currentPlaybackState = null;
  }
  
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Content script received message:', message.type);
      
      switch (message.type) {
        case 'GET_PLAYBACK_STATE':
          sendResponse(this.currentPlaybackState || {
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            isPaused: true,
            isMuted: false
          });
          break;
          
        case 'BLOCK_VIDEO':
          this.showBlockingOverlay(message.data.message);
          sendResponse({ success: true });
          break;
          
        case 'REQUEST_CLASSIFICATION':
          this.showClassificationDialog(message.data);
          sendResponse({ success: true });
          break;
          
        case 'SHOW_SETUP':
          this.showSetupDialog(message.data);
          sendResponse({ success: true });
          break;
          
        case 'SESSION_STARTED':
          this.showSessionNotification(message.data);
          sendResponse({ success: true });
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
          sendResponse({ error: 'Unknown message type' });
      }
    });
  }
  
  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      const isVisible = !document.hidden;
      console.log('Page visibility changed:', isVisible);
      
      chrome.runtime.sendMessage({
        type: 'VISIBILITY_CHANGE',
        data: { isVisible }
      });
    });
  }
  
  showBlockingOverlay(message) {
    if (this.blockingOverlay) {
      this.removeBlockingOverlay();
    }
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: 'YouTube Sans', 'Roboto', sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">⏰</div>
        <h2 style="font-size: 24px; margin-bottom: 16px; color: #ff0000;">Time's Up!</h2>
        <p style="font-size: 18px; margin-bottom: 24px; max-width: 400px;">${message}</p>
        <button id="close-overlay" style="
          background: #ff0000;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          font-family: inherit;
        ">Close</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.blockingOverlay = overlay;
    this.isBlocked = true;
    
    // Pause video if it's playing
    if (this.videoElement && !this.videoElement.paused) {
      this.videoElement.pause();
    }
    
    // Add close button functionality
    overlay.querySelector('#close-overlay').addEventListener('click', () => {
      this.removeBlockingOverlay();
    });
  }
  
  removeBlockingOverlay() {
    if (this.blockingOverlay) {
      this.blockingOverlay.remove();
      this.blockingOverlay = null;
      this.isBlocked = false;
    }
  }
  
  showClassificationDialog(data) {
    if (this.classificationDialog) {
      this.removeClassificationDialog();
    }
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      max-width: 400px;
      font-family: 'YouTube Sans', 'Roboto', sans-serif;
    `;
    
    const isEducational = data.isEducationalCategory;
    const isRelated = data.isRelatedToStudyArea;
    const studyArea = data.studyArea;
    
    let classificationText = '';
    if (isEducational && isRelated) {
      classificationText = `This video appears to be educational and related to your study area (${studyArea}).`;
    } else if (isEducational) {
      classificationText = `This video appears to be educational but may not be directly related to your study area (${studyArea}).`;
    } else {
      classificationText = `This video doesn't appear to be educational content.`;
    }
    
    dialog.innerHTML = `
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #030303;">Classify This Video</h3>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #606060; line-height: 1.4;">${classificationText}</p>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #606060;">Is this video relevant to your studies?</p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="classify-fun" style="
          background: #f2f2f2;
          color: #030303;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
        ">Fun Video</button>
        <button id="classify-study" style="
          background: #065fd4;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
        ">Study Video</button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    this.classificationDialog = dialog;
    
    // Add button functionality
    dialog.querySelector('#classify-study').addEventListener('click', () => {
      this.sendClassificationResponse(true, data.videoInfo);
    });
    
    dialog.querySelector('#classify-fun').addEventListener('click', () => {
      this.sendClassificationResponse(false, data.videoInfo);
    });
  }
  
  removeClassificationDialog() {
    if (this.classificationDialog) {
      this.classificationDialog.remove();
      this.classificationDialog = null;
    }
  }
  
  async sendClassificationResponse(isStudy, videoInfo) {
    try {
      await chrome.runtime.sendMessage({
        type: 'CLASSIFICATION_RESPONSE',
        data: { isStudy, videoInfo }
      });
      
      this.removeClassificationDialog();
      console.log('Sent classification response:', isStudy ? 'study' : 'fun');
    } catch (error) {
      console.error('Error sending classification response:', error);
    }
  }
  
  showSetupDialog(data) {
    if (this.setupDialog) {
      this.removeSetupDialog();
    }
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      max-width: 400px;
      font-family: 'YouTube Sans', 'Roboto', sans-serif;
    `;
    
    dialog.innerHTML = `
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #030303;">Welcome to YouTube Study Tracker!</h3>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #606060; line-height: 1.4;">
        To get started, please set up your study area and preferences in the extension popup.
      </p>
      <button id="open-popup" style="
        background: #065fd4;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        font-family: inherit;
      ">Open Extension Settings</button>
    `;
    
    document.body.appendChild(dialog);
    this.setupDialog = dialog;
    
    // Add button functionality
    dialog.querySelector('#open-popup').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
      this.removeSetupDialog();
    });
  }
  
  removeSetupDialog() {
    if (this.setupDialog) {
      this.setupDialog.remove();
      this.setupDialog = null;
    }
  }
  
  showSessionNotification(data) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${data.isStudy ? '#4CAF50' : '#FF9800'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: 'YouTube Sans', 'Roboto', sans-serif;
      font-size: 14px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = `Tracking ${data.isStudy ? 'study' : 'fun'} time`;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 3000);
  }
}

// Initialize the tracker when the script loads
new YouTubeTracker();