function r(s){if(!s)return null;const e=[/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,/youtube\.com\/v\/([^&\n?#]+)/,/youtube\.com\/watch\?.*v=([^&\n?#]+)/];for(const t of e){const i=s.match(t);if(i&&i[1])return i[1]}return null}class d{constructor(){this.currentVideoId=null,this.currentUrl="",this.videoElement=null,this.blockingOverlay=null,this.observer=null,this.playbackCheckInterval=null,this.isBlocked=!1,this.classificationDialog=null,this.setupDialog=null,this.urlCheckInterval=null,console.log("YouTube Study Tracker Content Script Starting..."),this.init()}async init(){try{this.isVideoPage()&&(console.log("Initial video page detected"),await this.handleVideoPageLoad()),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.startTracking()):await this.startTracking(),this.setupUrlChangeListener(),this.setupMessageListener(),this.setupVisibilityListener(),this.startPeriodicUrlCheck()}catch(e){console.error("Error initializing YouTube tracker:",e)}}async startTracking(){try{this.isVideoPage()&&await this.handleVideoPageLoad(),this.setupMutationObserver()}catch(e){console.error("Error starting tracking:",e)}}isVideoPage(){const e=window.location.pathname,t=e==="/watch"||e.startsWith("/watch?"),i=!!this.getVideoIdFromUrl();return console.log("Checking if video page:",{pathname:e,isWatchPage:t,hasVideoId:i}),t&&i}getVideoIdFromUrl(){const e=r(window.location.href);return console.log("Extracted video ID from URL:",e),e}startPeriodicUrlCheck(){this.urlCheckInterval=window.setInterval(()=>{const e=window.location.href;if(e!==this.currentUrl)if(console.log("URL changed:",this.currentUrl,"->",e),this.currentUrl=e,this.isVideoPage()){const t=this.getVideoIdFromUrl();t&&t!==this.currentVideoId&&(console.log("New video detected via URL check:",t),this.handleVideoPageLoad())}else this.cleanupVideoTracking()},2e3)}setupUrlChangeListener(){window.addEventListener("popstate",()=>{setTimeout(()=>{if(this.isVideoPage()){const e=this.getVideoIdFromUrl();e&&e!==this.currentVideoId&&(console.log("New video detected via popstate:",e),this.handleVideoPageLoad())}else this.cleanupVideoTracking()},100)})}setupMutationObserver(){this.observer=new MutationObserver(e=>{for(const t of e)if(t.type==="childList"){for(const i of t.addedNodes)if(i.nodeType===Node.ELEMENT_NODE){const o=i.querySelector("video")||(i.tagName==="VIDEO"?i:null);if(o&&this.isVideoPage()){console.log("Video element detected via mutation observer"),this.setupVideoTracking(o);break}}}}),this.observer.observe(document.body,{childList:!0,subtree:!0})}async handleVideoPageLoad(){try{const e=this.getVideoIdFromUrl();if(!e){console.log("No video ID found in URL");return}if(e===this.currentVideoId){console.log("Same video, skipping detection");return}console.log("New video page loaded:",e),this.currentVideoId=e,this.currentUrl=window.location.href,await new Promise(i=>setTimeout(i,1e3));const t=document.querySelector("video");t?this.setupVideoTracking(t):console.log("Video element not found, will wait for it"),await this.notifyVideoDetected()}catch(e){console.error("Error handling video page load:",e)}}setupVideoTracking(e){this.videoElement!==e&&(console.log("Setting up video tracking for element:",e),this.videoElement=e,this.startPlaybackMonitoring(),e.addEventListener("play",()=>this.onVideoPlay()),e.addEventListener("pause",()=>this.onVideoPause()),e.addEventListener("ended",()=>this.onVideoEnded()),e.addEventListener("timeupdate",()=>this.onVideoTimeUpdate()))}startPlaybackMonitoring(){this.playbackCheckInterval&&clearInterval(this.playbackCheckInterval),this.playbackCheckInterval=setInterval(()=>{this.videoElement&&this.updatePlaybackState()},2e3)}updatePlaybackState(){if(!this.videoElement)return;const e={isPlaying:!this.videoElement.paused,currentTime:this.videoElement.currentTime,duration:this.videoElement.duration,isPaused:this.videoElement.paused,isMuted:this.videoElement.muted};this.currentPlaybackState=e}onVideoPlay(){console.log("Video started playing"),this.updatePlaybackState()}onVideoPause(){console.log("Video paused"),this.updatePlaybackState()}onVideoEnded(){console.log("Video ended"),this.cleanupVideoTracking()}onVideoTimeUpdate(){this.updatePlaybackState()}async notifyVideoDetected(){try{await chrome.runtime.sendMessage({type:"VIDEO_DETECTED",data:{url:window.location.href,videoId:this.currentVideoId}}),console.log("Notified service worker about video detection")}catch(e){console.error("Error notifying service worker:",e)}}cleanupVideoTracking(){console.log("Cleaning up video tracking"),this.playbackCheckInterval&&(clearInterval(this.playbackCheckInterval),this.playbackCheckInterval=null),this.videoElement&&(this.videoElement.removeEventListener("play",this.onVideoPlay),this.videoElement.removeEventListener("pause",this.onVideoPause),this.videoElement.removeEventListener("ended",this.onVideoEnded),this.videoElement.removeEventListener("timeupdate",this.onVideoTimeUpdate),this.videoElement=null),this.currentVideoId=null,this.currentPlaybackState=null}setupMessageListener(){chrome.runtime.onMessage.addListener((e,t,i)=>{switch(console.log("Content script received message:",e.type),e.type){case"GET_PLAYBACK_STATE":i(this.currentPlaybackState||{isPlaying:!1,currentTime:0,duration:0,isPaused:!0,isMuted:!1});break;case"BLOCK_VIDEO":this.showBlockingOverlay(e.data.message),i({success:!0});break;case"REQUEST_CLASSIFICATION":this.showClassificationDialog(e.data),i({success:!0});break;case"SHOW_SETUP":this.showSetupDialog(e.data),i({success:!0});break;case"SESSION_STARTED":this.showSessionNotification(e.data),i({success:!0});break;default:console.warn("Unknown message type:",e.type),i({error:"Unknown message type"})}})}setupVisibilityListener(){document.addEventListener("visibilitychange",()=>{const e=!document.hidden;console.log("Page visibility changed:",e),chrome.runtime.sendMessage({type:"VISIBILITY_CHANGE",data:{isVisible:e}})})}showBlockingOverlay(e){this.blockingOverlay&&this.removeBlockingOverlay();const t=document.createElement("div");t.style.cssText=`
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
    `,t.innerHTML=`
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">⏰</div>
        <h2 style="font-size: 24px; margin-bottom: 16px; color: #ff0000;">Time's Up!</h2>
        <p style="font-size: 18px; margin-bottom: 24px; max-width: 400px;">${e}</p>
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
    `,document.body.appendChild(t),this.blockingOverlay=t,this.isBlocked=!0,this.videoElement&&!this.videoElement.paused&&this.videoElement.pause(),t.querySelector("#close-overlay").addEventListener("click",()=>{this.removeBlockingOverlay()})}removeBlockingOverlay(){this.blockingOverlay&&(this.blockingOverlay.remove(),this.blockingOverlay=null,this.isBlocked=!1)}showClassificationDialog(e){this.classificationDialog&&this.removeClassificationDialog();const t=document.createElement("div");t.style.cssText=`
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
    `;const i=e.isEducationalCategory,o=e.isRelatedToStudyArea,a=e.studyArea;let n="";i&&o?n=`This video appears to be educational and related to your study area (${a}).`:i?n=`This video appears to be educational but may not be directly related to your study area (${a}).`:n="This video doesn't appear to be educational content.",t.innerHTML=`
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #030303;">Classify This Video</h3>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #606060; line-height: 1.4;">${n}</p>
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
    `,document.body.appendChild(t),this.classificationDialog=t,t.querySelector("#classify-study").addEventListener("click",()=>{this.sendClassificationResponse(!0,e.videoInfo)}),t.querySelector("#classify-fun").addEventListener("click",()=>{this.sendClassificationResponse(!1,e.videoInfo)})}removeClassificationDialog(){this.classificationDialog&&(this.classificationDialog.remove(),this.classificationDialog=null)}async sendClassificationResponse(e,t){try{await chrome.runtime.sendMessage({type:"CLASSIFICATION_RESPONSE",data:{isStudy:e,videoInfo:t}}),this.removeClassificationDialog(),console.log("Sent classification response:",e?"study":"fun")}catch(i){console.error("Error sending classification response:",i)}}showSetupDialog(e){this.setupDialog&&this.removeSetupDialog();const t=document.createElement("div");t.style.cssText=`
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
    `,t.innerHTML=`
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
    `,document.body.appendChild(t),this.setupDialog=t,t.querySelector("#open-popup").addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_POPUP"}),this.removeSetupDialog()})}removeSetupDialog(){this.setupDialog&&(this.setupDialog.remove(),this.setupDialog=null)}showSessionNotification(e){const t=document.createElement("div");t.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${e.isStudy?"#4CAF50":"#FF9800"};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: 'YouTube Sans', 'Roboto', sans-serif;
      font-size: 14px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-out;
    `,t.textContent=`Tracking ${e.isStudy?"study":"fun"} time`;const i=document.createElement("style");i.textContent=`
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `,document.head.appendChild(i),document.body.appendChild(t),setTimeout(()=>{t.remove(),i.remove()},3e3)}}new d;
