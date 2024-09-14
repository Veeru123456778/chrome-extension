chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle video category confirmation
  console.log(request);
  if (request) {
//   if (request.videoCategoryId) {
      let categoryId = request.videoCategoryId;
      console.log('Video category ID:', categoryId);

      if (categoryId == 25 || categoryId == 27 || categoryId == 28) {
          let educational = window.confirm("Is this related to your course?");
          if (educational) {
              sendResponse({ status: 'Video related to education', value: 'Educational', type: 'Category' });
              return true;
          } else {
              BlockVideo(request);
              sendResponse({ status: 'Video not related to education', value: 'NonEducational', type: 'Category' });
              return true;
          }

          return true; // Exit after sending the response to prevent further execution
      }

      BlockVideo(request);
      sendResponse({ status: 'Video not related to education', value: 'NonEducational', type: 'Category' });
  }

  // Handle time updates to send to the React frontend
  if (request.updatedTime) {
      let category = request.videoCategory;
      let time = request.updatedTime;

      // Send the message directly to the React frontend
      chrome.runtime.sendMessage({
          type: 'UPDATE_TIME',
          videoCategory: category,
          updatedTime: time
      });
  }

  
});


function BlockVideo(request){

    if (request.action === 'stopVideoTimeExceeds' ) {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            setInterval(()=>{
                videoElement.pause();
            },1000)
            console.log("Video stopped due to time constraints");

            // Display a blocking overlay
            const overlay = document.createElement('div');
            overlay.id = 'block-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor =  'black';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // 50% opacity

            overlay.style.zIndex = '9999';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.color = '#fff';
            overlay.style.fontSize = '24px';
            overlay.innerText = 'You need to watch more educational content before watching fun videos.';
            
            const button = document.createElement('a');
            button.href = 'https://www.youtube.com';
            button.style.marginTop = '20px';
            button.style.padding = '10px 20px';
            button.style.backgroundColor = 'rgb(255, 0, 0)';
            // button.style.backgroundColor = '#007bff';
            button.style.color = '#fff';
            button.style.textDecoration = 'none';
            button.style.borderRadius = '5px';
            button.style.fontSize = '18px';
            button.innerText = 'Go To HomePage';

    
            window.addEventListener('keydown', (event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault(); // Prevents the spacebar and Enter key from performing their default actions
                    console.log(`${event.key} key action prevented.`);
                }
            }); // Remove event listener after handling
            
            overlay.appendChild(button);
            document.body.appendChild(overlay);
        }
    }
}

// content.js
// let videoStartTime = null;
// let currentTabId = null;
// const educationalCategories = [25, 27, 28];

// function getVideoCategory() {
//   // Get video category ID from YouTube metadata
//   // Adjust this based on actual implementation
//   const categoryMeta = document.querySelector('meta[itemprop="category"]');
//   return categoryMeta ? parseInt(categoryMeta.content, 10) : null;
// }

// function handleVideoChange() {
//   const categoryId = getVideoCategory();
//   if (!categoryId) return;

//   const isEducational = educationalCategories.includes(categoryId);
//   chrome.storage.local.set({ currentCategory: isEducational ? 'study' : 'fun' });

//   if (isEducational) {
//     chrome.storage.local.get(['hasConfirmed'], function (result) {
//       if (result.hasConfirmed === undefined) {
//         chrome.storage.local.set({ hasConfirmed: false });
//         if (confirm("Is this video related to your course?")) {
//           chrome.storage.local.set({ currentCategory: 'study', hasConfirmed: true });
//         } else {
//           chrome.storage.local.set({ currentCategory: 'fun', hasConfirmed: true });
//         }
//       }
//     });
//   } else {
//     chrome.storage.local.set({ currentCategory: 'fun' });
//   }

//   chrome.storage.local.get(['currentCategory'], function (result) {
//     const currentCategory = result.currentCategory;
//     videoStartTime = Date.now();
//     chrome.storage.local.set({ videoStartTime, currentCategory });
//   });
// }

// function updateTime() {
//   chrome.storage.local.get(['videoStartTime', 'currentCategory'], function (result) {
//     const { videoStartTime, currentCategory } = result;
//     if (videoStartTime && currentCategory) {
//       const elapsed = Date.now() - videoStartTime;
//       chrome.storage.local.get(['timeData'], function (result) {
//         let timeData = result.timeData || { study: 0, fun: 0 };
//         timeData[currentCategory] = (timeData[currentCategory] || 0) + elapsed;
//         chrome.storage.local.set({ timeData });
//         videoStartTime = Date.now();
//         chrome.storage.local.set({ videoStartTime });
//       });
//     }
//   });
// }

// function handleTabChange() {
//   chrome.storage.local.get(['currentTabId'], function (result) {
//     currentTabId = result.currentTabId;
//     if (currentTabId) {
//       chrome.tabs.update(currentTabId, { muted: false });
//     }
//   });
// }

// document.addEventListener('yt-navigate-finish', handleVideoChange);
// setInterval(updateTime, 1000);
