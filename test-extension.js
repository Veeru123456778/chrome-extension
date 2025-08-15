// Test script to verify extension functionality
// Run this in the browser console after loading the extension

console.log('Testing YouTube Study Tracker Extension...');

// Test 1: Check if service worker is responding
async function testServiceWorker() {
  try {
    console.log('Testing service worker communication...');
    
    const statsResponse = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
    console.log('✅ GET_STATS response:', statsResponse);
    
    const settingsResponse = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    console.log('✅ GET_SETTINGS response:', settingsResponse);
    
    return true;
  } catch (error) {
    console.error('❌ Service worker test failed:', error);
    return false;
  }
}

// Test 2: Check storage initialization
async function testStorage() {
  try {
    console.log('Testing storage...');
    
    const result = await chrome.storage.local.get(['settings', 'timeStats', 'activeSessions', 'sessionHistory']);
    console.log('✅ Storage data:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
}

// Test 3: Check if content script is active on YouTube
function testContentScript() {
  try {
    console.log('Testing content script...');
    
    if (window.location.hostname.includes('youtube.com')) {
      console.log('✅ On YouTube domain');
      
      // Check if video element exists
      const videoElement = document.querySelector('video');
      if (videoElement) {
        console.log('✅ Video element found');
      } else {
        console.log('⚠️ No video element found (might be on non-video page)');
      }
    } else {
      console.log('⚠️ Not on YouTube domain');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Content script test failed:', error);
    return false;
  }
}

// Test 4: Check extension permissions
async function testPermissions() {
  try {
    console.log('Testing permissions...');
    
    const permissions = await chrome.permissions.getAll();
    console.log('✅ Extension permissions:', permissions);
    
    return true;
  } catch (error) {
    console.error('❌ Permissions test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting extension tests...\n');
  
  const results = {
    serviceWorker: await testServiceWorker(),
    storage: await testStorage(),
    contentScript: testContentScript(),
    permissions: await testPermissions()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Service Worker:', results.serviceWorker ? '✅ PASS' : '❌ FAIL');
  console.log('Storage:', results.storage ? '✅ PASS' : '❌ FAIL');
  console.log('Content Script:', results.contentScript ? '✅ PASS' : '❌ FAIL');
  console.log('Permissions:', results.permissions ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return allPassed;
}

// Auto-run tests if this script is executed
if (typeof chrome !== 'undefined' && chrome.runtime) {
  runAllTests();
} else {
  console.log('❌ Chrome extension API not available');
}