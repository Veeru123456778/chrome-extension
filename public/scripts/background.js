const CLIENT_ID = '11577713610-hikcmikgrqtvreloovjeb23ofep4m7l3.apps.googleusercontent.com';
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const apiKey = 'AIzaSyBzH896zzsU0X15sxh6o6KVLFK7oa5LJbI'; 


let activeTabId = null;

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed.');
    initializeGlobalVariables();
});

function initializeGlobalVariables() {
    const defaultValues = {
        globalFunTime: 0,
        globalStudyTime: 0,
        videoCategory: '',
        currentVideoStartTime: 0,
    };

    chrome.storage.local.get(Object.keys(defaultValues), (result) => {
        Object.keys(defaultValues).forEach((key) => {
            if (result[key] === undefined) {
                chrome.storage.local.set({ [key]: defaultValues[key] }, () => {
                    console.log(`${key} initialized to ${defaultValues[key]}.`);
                });
            } else {
                console.log(`${key} already set:`, result[key]);
            }
        });
    });
}

// Listen for updates to tabs
chrome.tabs.onUpdated.addListener(( tabId,changeInfo, tab) => {

    if (tab.url && tab.url.includes('youtube.com')) {
        if (changeInfo.url || changeInfo.status === 'complete') {
            processLastWatchTime(tabId,() => {
                if (activeTabId && activeTabId !== tabId) {
                    chrome.tabs.sendMessage(activeTabId, { action: 'stopVideo' });
                }
                activeTabId = tabId;
                injectContentScripts(tabId, tab.url);
                checkTimeBoundary(tabId);
            });
        }
    }
});


// function checkTimeBoundary(tabId) {
//     chrome.storage.local.get(['videoCategory','globalFunTime', 'globalStudyTime', 'lastAlertTime'], result => {
//          const category = result.videoCategory;
//         if (result.globalFunTime > result.globalStudyTime && category=='NonEducational') { // 1-hour delay between alerts
//             chrome.tabs.query({ active: true, currentWindow: true }, () => {
//                 chrome.tabs.sendMessage(tabId, { action: 'stopVideoTimeExceeds' });            
//             });
//         }
//     });
// }

function checkTimeBoundary(tabId) {
    chrome.storage.local.get(['videoCategory', 'globalFunTime', 'globalStudyTime', 'lastAlertTime'], result => {
        const category = result.videoCategory;

        if (result.globalFunTime > result.globalStudyTime && category === 'NonEducational') {
            // chrome.tabs.query({ active: true, currentWindow: true }, () => {
                chrome.tabs.sendMessage(tabId, { action: 'stopVideoTimeExceeds' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message to content script:', chrome.runtime.lastError);
                    } else {
                        console.log('Message sent successfully');
                    }
                });
            // });
        }
    });
}



// Handle tab closure to process pending time calculations
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === activeTabId) {
        handleTabClosure(tabId);
        activeTabId = null;
    }
});

// Process the last watched time when navigating between videos or closing tabs
function processLastWatchTime(tabId,callback) {
    chrome.storage.local.get(['videoCategory', 'globalFunTime', 'globalStudyTime', 'currentVideoStartTime'], (result) => {
        const { videoCategory, globalFunTime = 0, globalStudyTime = 0, currentVideoStartTime = 0 } = result;

        if (currentVideoStartTime > 0) {
            const watchedTime = Math.floor(Date.now() / 1000) - currentVideoStartTime;
            handlePendingCalculations(tabId,videoCategory, watchedTime, globalFunTime, globalStudyTime, callback);
        } else {
            if (typeof callback === 'function') callback();
        }
    });
}

// Handle calculations based on the video category (Educational or NonEducational)
function handlePendingCalculations(tabId,currentCategory, watchedTime, globalFunTime, globalStudyTime, callback) {
    let update = {};
    if (currentCategory === 'NonEducational') {
        update.globalFunTime = globalFunTime + watchedTime;
    } else if (currentCategory === 'Educational') {
        update.globalStudyTime = globalStudyTime + watchedTime;
    }
    update.currentVideoStartTime = 0;
     
    chrome.storage.local.set(update, () => {
        console.log(`Time updated for ${currentCategory}:`, update);
        if (typeof callback === 'function') callback();
        checkTimeBoundary(tabId);
    });
}

// Inject content scripts into the YouTube video page
function injectContentScripts(tabId, url) {
    const videoId = new URL(url).searchParams.get('v');
    if (videoId) {
        fetchVideoCategory(videoId).then(newCategoryId => {
            injectScriptsAndMonitor(tabId, newCategoryId);
        }).catch(error => {
            console.error('Error fetching video category:', error);
        });
    }
}


// Inject scripts and monitor the video playback status
// function injectScriptsAndMonitor(tabId, categoryId) {
//     chrome.scripting.executeScript({
//         target: { tabId },
//         files: ['scripts/content.js', 'scripts/monitor-playback.js']
//     }, () => {
//         let action = "";
//         chrome.storage.local.get(['globalFunTime', 'globalStudyTime'],(result)=>{
//             if(result.globalFunTime>=result.globalStudyTime){
//                 action = "stopVideoTimeExceeds";
//             }
//         })
//         chrome.tabs.sendMessage(tabId, { videoCategoryId: categoryId,action:action }, (response) => {
//             if (response && response.value) {
//                 chrome.storage.local.set({ videoCategory: response.value, currentVideoStartTime: Math.floor(Date.now() / 1000) });
//             }
//         });
//     });
// }


function injectScriptsAndMonitor(tabId, categoryId) {
    chrome.scripting.executeScript({
        target: { tabId },
        files: ['scripts/content.js', 'scripts/monitor-playback.js']
    }, () => {
        // Fetch global time data from storage
        chrome.storage.local.get(['globalFunTime', 'globalStudyTime'], (result) => {
            const { globalFunTime = 0, globalStudyTime = 0 } = result;

            // Determine the action based on time constraints
            let action = "";
            if (globalFunTime >= globalStudyTime) {
                action = "stopVideoTimeExceeds";
            }

            // Send message to content script with videoCategoryId and action
            chrome.tabs.sendMessage(tabId, { videoCategoryId: categoryId, action: action }, (response) => {
                if (response && response.value) {
                    chrome.storage.local.set({ 
                        videoCategory: response.value, 
                        currentVideoStartTime: Math.floor(Date.now() / 1000)
                    });
                }
            });
        });
    });
}


// ,action:"stopVideoTimeExceeds"

// Handle the closure of the active tab
function handleTabClosure(tabId) {
    if (tabId === activeTabId) {
        processLastWatchTime(() => {
            chrome.storage.local.set({ currentVideoStartTime: 0 });
        });
        activeTabId = null;
    }
}

// Fetch the video category from YouTube API
async function fetchVideoCategory(videoId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
        const categoryId = data.items[0].snippet.categoryId;
        console.log("Category Id is: ", categoryId);
        return categoryId;
    } else {
        throw new Error('Video not found');
    }
}

// Handle playback status changes (play, pause, stop)
function handlePlaybackStatus(request) {
    const { status, startTime, stopTime } = request;
    if (status === "pause" || status === "stop") {
        const watchTime = stopTime - startTime;
        chrome.storage.local.get(['videoCategory', 'globalFunTime', 'globalStudyTime'], (result) => {
            const { videoCategory, globalFunTime = 0, globalStudyTime = 0 } = result;

            let updatedTime = 0;
            if (videoCategory === 'NonEducational') {
                updatedTime = globalFunTime + watchTime;
                chrome.storage.local.set({ globalFunTime: updatedTime });
            } else if (videoCategory === 'Educational') {
                updatedTime = globalStudyTime + watchTime;
                chrome.storage.local.set({ globalStudyTime: updatedTime });
            }
            console.log(`${videoCategory} time updated to:`, updatedTime);
            chrome.tabs.sendMessage(activeTabId, { videoCategory, updatedTime });
            chrome.storage.local.set({ currentVideoStartTime: 0 });
            checkTimeBoundary(activeTabId);
        });
    } else if (status === "play") {
        chrome.storage.local.set({ currentVideoStartTime: startTime });
    }
}

// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'GET_INITIAL_GLOBAL_TIMES') {
        sendGlobalTimes();
        sendResponse({ status: 'Initial global times sent' });
    }
    if (request.status === "play" || request.status === "pause" || request.status === "stop") {
        handlePlaybackStatus(request);
        sendResponse({ received: true });
    } else if (request.type === 'REQUEST_CHANNEL_DATA') {
        getAuthToken(true, sendResponse);
        return true;  // Asynchronous response
    }
});


function sendGlobalTimes() {
    chrome.storage.local.get(['globalFunTime', 'globalStudyTime'], (result) => {
        const globalFunTime = result.globalFunTime || 0;
        const globalStudyTime = result.globalStudyTime || 0;

        chrome.runtime.sendMessage({
            action: 'INITIAL_GLOBAL_TIMES',
            globalFunTime,
            globalStudyTime
        });
    });
}


function getAuthToken(interactive, sendResponse) {
    console.log('Requesting token (interactive:', interactive, ')');
    chrome.identity.getAuthToken({ interactive }, (token) => {
        if (chrome.runtime.lastError || !token) {
            console.error('Error retrieving token:', chrome.runtime.lastError);
            if (!interactive) {
                chrome.identity.removeCachedAuthToken({ token }, () => {
                    getAuthToken(true, sendResponse);
                });
            } else {
                sendResponse({ error: chrome.runtime.lastError });
            }
        } else {
            console.log('Token acquired:', token);
            fetchChannelData(token, sendResponse);
        }
    });
}

function fetchChannelData(token, sendResponse) {
    const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true';
    fetch(url, {
        headers: new Headers({ 'Authorization': 'Bearer ' + token })
    })
    .then(response => response.json())
    .then(data => {
        if (data.items && data.items.length > 0) {
            const channel = data.items[0];
            sendResponse({ channel });
        } else {
            sendResponse({ error: 'No channel found.' });
        }
    })
    .catch(error => {
        sendResponse({ error: 'Error fetching channel data.' });
    });
}
