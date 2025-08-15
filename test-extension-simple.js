// Simple test for YouTube Study Tracker Extension
console.log('Testing extension...');

// Test service worker communication
chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
  console.log('GET_STATS response:', response);
});

chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
  console.log('GET_SETTINGS response:', response);
});

// Test storage
chrome.storage.local.get(['settings', 'timeStats'], (result) => {
  console.log('Storage data:', result);
});