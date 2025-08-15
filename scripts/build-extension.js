import { readFileSync, writeFileSync, copyFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to extract YouTube API functions from the built assets
function extractYouTubeAPI() {
  try {
    const assetsDir = resolve(__dirname, '../dist/assets');
    const files = readdirSync(assetsDir);
    
    // Find the YouTube API file
    const youtubeApiFile = files.find(file => file.startsWith('youtube-api-'));
    
    if (youtubeApiFile) {
      const assetFile = resolve(assetsDir, youtubeApiFile);
      const assetContent = readFileSync(assetFile, 'utf8');
      
      // Extract the functions from the export statement
      const exportMatch = assetContent.match(/export\s*\{([^}]+)\}/);
      
      if (exportMatch) {
        const exports = exportMatch[1];
        const pMatch = exports.match(/p\s+as\s+(\w+)/);
        const dMatch = exports.match(/d\s+as\s+(\w+)/);
        
        if (pMatch && dMatch) {
          const classifyVideoName = pMatch[1];
          const extractVideoIdName = dMatch[1];
          
          // Create the function mappings
          const functionMappings = {
            [classifyVideoName]: 'p',
            [extractVideoIdName]: 'd'
          };
          
          return {
            assetContent,
            functionMappings
          };
        }
      }
    }
  } catch (error) {
    console.error('Error extracting YouTube API:', error);
  }
  
  return null;
}

// Function to create a standalone content script
function createStandaloneContentScript() {
  const contentScriptPath = resolve(__dirname, '../dist/content.js');
  const contentScript = readFileSync(contentScriptPath, 'utf8');
  
  // Remove the import statement and replace with inline code
  const youtubeAPI = extractYouTubeAPI();
  
  if (youtubeAPI) {
    // Remove the export statement from the API content
    const apiContentWithoutExport = youtubeAPI.assetContent.replace(/export\s*\{[^}]+\};?/, '');
    
    // Create a new content script with the API functions inline
    const standaloneContent = `
// YouTube API functions
${apiContentWithoutExport}

// Content script
${contentScript.replace(/import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?/, '')}
`;
    
    writeFileSync(contentScriptPath, standaloneContent);
    console.log('✅ Content script bundled successfully');
  } else {
    console.error('❌ Could not extract YouTube API functions');
  }
}

// Function to create a standalone service worker
function createStandaloneServiceWorker() {
  const serviceWorkerPath = resolve(__dirname, '../dist/service-worker.js');
  const serviceWorker = readFileSync(serviceWorkerPath, 'utf8');
  
  // Remove the import statement and replace with inline code
  const youtubeAPI = extractYouTubeAPI();
  
  if (youtubeAPI) {
    // Remove the export statement from the API content
    const apiContentWithoutExport = youtubeAPI.assetContent.replace(/export\s*\{[^}]+\};?/, '');
    
    // Create a new service worker with the API functions inline
    const standaloneServiceWorker = `
// YouTube API functions
${apiContentWithoutExport}

// Service worker
${serviceWorker.replace(/import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?/, '')}
`;
    
    writeFileSync(serviceWorkerPath, standaloneServiceWorker);
    console.log('✅ Service worker bundled successfully');
  } else {
    console.error('❌ Could not extract YouTube API functions');
  }
}

// Main build function
function buildExtension() {
  console.log('🔨 Building Chrome extension...');
  
  try {
    // Create standalone content script
    createStandaloneContentScript();
    
    // Create standalone service worker
    createStandaloneServiceWorker();
    
    // Copy extension files
    copyFileSync(resolve(__dirname, '../public/manifest.json'), resolve(__dirname, '../dist/manifest.json'));
    copyFileSync(resolve(__dirname, '../public/icon16.png'), resolve(__dirname, '../dist/icon16.png'));
    copyFileSync(resolve(__dirname, '../public/icon48.png'), resolve(__dirname, '../dist/icon48.png'));
    copyFileSync(resolve(__dirname, '../public/icon128.png'), resolve(__dirname, '../dist/icon128.png'));
    
    console.log('✅ Chrome extension built successfully!');
    console.log('📁 Extension files are in the dist/ directory');
    console.log('🚀 Load the dist/ folder as an unpacked extension in Chrome');
  } catch (error) {
    console.error('❌ Error building extension:', error);
    process.exit(1);
  }
}

buildExtension();