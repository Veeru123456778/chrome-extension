function monitorPlayback() {
    const videoElement = document.querySelector('video');

    let isVideoPlaying = false;
    let startTime = 0;
    if (videoElement) {
        videoElement.addEventListener('play', () => {
            startTime = Math.floor(Date.now()/1000);
            chrome.runtime.sendMessage({ status: 'play', startTime });
            isVideoPlaying = true;
            console.log("Play event captured at time:", startTime);  // Debugging log
        });

        videoElement.addEventListener('pause', () => {
            if (isVideoPlaying) {
                const stopTime = Math.floor(Date.now()/1000);
                const watchTime = stopTime - startTime;
                chrome.runtime.sendMessage({ status: 'pause', startTime, stopTime, watchTime });
                isVideoPlaying = false;
                console.log("Pause event captured at time:", stopTime);  // Debugging log
            }
        });

        // Handle unload event for browser close or tab close
        window.addEventListener('beforeunload', () => {
            if (isVideoPlaying) {
                const stopTime = Math.floor(Date.now()/1000); 
                const watchTime = stopTime - startTime;
                chrome.runtime.sendMessage({ status: 'stop', startTime, stopTime, watchTime });
                isVideoPlaying = false;
                console.log("Unload event captured at time:", stopTime);  // Debugging log
            }
        });
    } else {
        console.error('Video element not found.');
    }
}


// Use a MutationObserver to detect when the video element is added to the DOM
const observer = new MutationObserver((mutationsList, observer) => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
        monitorPlayback();
        observer.disconnect(); // Stop observing once the video element is found
    }
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Listen for messages from background script to handle multiple tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'stopVideo') {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoElement.pause();
            isVideoPlaying = false;
            console.log("Video stopped by background script");
        }
    }
    sendResponse({ received: true });
});

// background.js
// let activeTabId = null;
// let tabData = {};

// chrome.tabs.onActivated.addListener((activeInfo) => {
//   if (activeTabId !== null) {
//     chrome.scripting.executeScript({
//       target: { tabId: activeTabId },
//       files: ['content.js']
//     });
//   }

//   activeTabId = activeInfo.tabId;
//   chrome.storage.local.get(['timeData'], function (result) {
//     tabData[activeTabId] = result.timeData || { study: 0, fun: 0 };
//   });
// });

// chrome.tabs.onRemoved.addListener((tabId) => {
//   delete tabData[tabId];
// });

// chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
//   if (changeInfo.status === 'complete') {
//     chrome.scripting.executeScript({
//       target: { tabId },
//       files: ['content.js']
//     });
//   }
// });
