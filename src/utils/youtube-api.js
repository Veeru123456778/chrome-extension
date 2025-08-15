// YouTube API utility functions

// Educational category IDs from YouTube API
const EDUCATIONAL_CATEGORIES = [
  27, // Education
  28, // Science & Technology
  29, // Nonprofits & Activism
  26, // Howto & Style (tutorials)
  25, // News & Politics
  24, // Entertainment (some educational content)
  22, // People & Blogs (educational channels)
  20, // Gaming (educational gaming content)
  15, // Pets & Animals (educational content)
  10, // Music (music education)
  1   // Film & Animation (educational content)
];

// Study area keywords for classification
const STUDY_AREA_KEYWORDS = {
  'Computer Science': [
    'programming', 'coding', 'software', 'computer', 'algorithm', 'data structure',
    'web development', 'javascript', 'python', 'java', 'react', 'node.js', 'database',
    'machine learning', 'artificial intelligence', 'cybersecurity', 'networking'
  ],
  'Mathematics': [
    'math', 'mathematics', 'algebra', 'calculus', 'geometry', 'statistics', 'probability',
    'linear algebra', 'differential equations', 'number theory', 'analysis'
  ],
  'Physics': [
    'physics', 'mechanics', 'thermodynamics', 'electromagnetism', 'quantum', 'relativity',
    'optics', 'nuclear', 'particle', 'astronomy', 'cosmology'
  ],
  'Chemistry': [
    'chemistry', 'organic', 'inorganic', 'biochemistry', 'analytical', 'physical chemistry',
    'molecular', 'reaction', 'compound', 'element', 'molecule'
  ],
  'Biology': [
    'biology', 'cell', 'genetics', 'evolution', 'ecology', 'microbiology', 'anatomy',
    'physiology', 'biochemistry', 'molecular biology', 'neuroscience'
  ],
  'Engineering': [
    'engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'aerospace',
    'biomedical', 'structural', 'robotics', 'automation', 'control systems'
  ],
  'Medicine': [
    'medicine', 'medical', 'health', 'anatomy', 'physiology', 'pathology', 'pharmacology',
    'surgery', 'diagnosis', 'treatment', 'disease', 'patient'
  ],
  'Business': [
    'business', 'management', 'marketing', 'finance', 'economics', 'entrepreneurship',
    'strategy', 'leadership', 'accounting', 'investment', 'startup'
  ],
  'History': [
    'history', 'historical', 'ancient', 'medieval', 'modern', 'world war', 'civilization',
    'empire', 'revolution', 'archaeology', 'anthropology'
  ],
  'Literature': [
    'literature', 'poetry', 'novel', 'fiction', 'classic', 'author', 'writing', 'analysis',
    'criticism', 'rhetoric', 'composition'
  ],
  'Psychology': [
    'psychology', 'mental health', 'behavior', 'cognitive', 'social psychology',
    'neuroscience', 'therapy', 'counseling', 'personality', 'development'
  ],
  'Philosophy': [
    'philosophy', 'ethics', 'logic', 'metaphysics', 'epistemology', 'philosopher',
    'argument', 'reasoning', 'critical thinking', 'moral', 'existential'
  ]
};

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Get video information from YouTube API
 */
async function getVideoInfo(videoId, apiKey) {
  if (!apiKey) {
    console.log('No API key provided, using fallback classification');
    return null;
  }
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        title: video.snippet.title,
        description: video.snippet.description,
        categoryId: video.snippet.categoryId,
        categoryName: getCategoryName(video.snippet.categoryId),
        channelTitle: video.snippet.channelTitle,
        tags: video.snippet.tags || [],
        viewCount: video.statistics?.viewCount,
        likeCount: video.statistics?.likeCount
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching video info:', error);
    return null;
  }
}

/**
 * Get category name from category ID
 */
function getCategoryName(categoryId) {
  const categories = {
    1: 'Film & Animation',
    2: 'Autos & Vehicles',
    10: 'Music',
    15: 'Pets & Animals',
    17: 'Sports',
    19: 'Travel & Events',
    20: 'Gaming',
    22: 'People & Blogs',
    23: 'Comedy',
    24: 'Entertainment',
    25: 'News & Politics',
    26: 'Howto & Style',
    27: 'Education',
    28: 'Science & Technology',
    29: 'Nonprofits & Activism'
  };
  
  return categories[categoryId] || 'Unknown';
}

/**
 * Check if video is in educational category
 */
function isEducationalCategory(categoryId) {
  return EDUCATIONAL_CATEGORIES.includes(parseInt(categoryId));
}

/**
 * Check if video is related to study area
 */
function isRelatedToStudyArea(videoInfo, studyArea) {
  if (!videoInfo || !studyArea) return false;
  
  const keywords = STUDY_AREA_KEYWORDS[studyArea];
  if (!keywords) return false;
  
  const text = `${videoInfo.title} ${videoInfo.description || ''} ${videoInfo.tags?.join(' ') || ''}`.toLowerCase();
  
  return keywords.some(keyword => text.includes(keyword.toLowerCase()));
}

/**
 * Classify video based on category and study area
 */
export async function classifyVideo(videoId, studyArea, apiKey) {
  try {
    console.log(`Classifying video ${videoId} for study area: ${studyArea}`);
    
    // Get video information
    const videoInfo = await getVideoInfo(videoId, apiKey);
    
    if (!videoInfo) {
      // Fallback classification without API
      return {
        videoInfo: {
          title: 'Unknown Video',
          categoryName: 'Unknown',
          categoryId: 0
        },
        isEducationalCategory: false,
        isRelatedToStudyArea: false,
        recommendedClassification: 'unknown',
        confidence: 0.5
      };
    }
    
    // Check if it's an educational category
    const isEducational = isEducationalCategory(videoInfo.categoryId);
    
    // Check if it's related to study area
    const isRelated = isRelatedToStudyArea(videoInfo, studyArea);
    
    let recommendedClassification = 'unknown';
    let confidence = 0.5;
    
    // Classification logic
    if (isEducational && isRelated) {
      recommendedClassification = 'study';
      confidence = 0.9;
    } else if (isEducational && !isRelated) {
      recommendedClassification = 'study';
      confidence = 0.7;
    } else if (!isEducational && !isRelated) {
      recommendedClassification = 'fun';
      confidence = 0.8;
    } else {
      // Mixed signals - ask user
      recommendedClassification = 'unknown';
      confidence = 0.5;
    }
    
    console.log('Classification result:', {
      title: videoInfo.title,
      category: videoInfo.categoryName,
      isEducational,
      isRelated,
      recommendedClassification,
      confidence
    });
    
    return {
      videoInfo,
      isEducationalCategory: isEducational,
      isRelatedToStudyArea: isRelated,
      recommendedClassification,
      confidence
    };
    
  } catch (error) {
    console.error('Error classifying video:', error);
    
    return {
      videoInfo: {
        title: 'Error classifying video',
        categoryName: 'Unknown',
        categoryId: 0
      },
      isEducationalCategory: false,
      isRelatedToStudyArea: false,
      recommendedClassification: 'unknown',
      confidence: 0.0
    };
  }
}

/**
 * Get study areas for selection
 */
export function getStudyAreas() {
  return Object.keys(STUDY_AREA_KEYWORDS).map(area => ({
    id: area.toLowerCase().replace(/\s+/g, '-'),
    name: area
  }));
}

/**
 * Search for videos by query (for testing)
 */
export async function searchVideos(query, apiKey, maxResults = 10) {
  if (!apiKey) {
    console.error('API key required for video search');
    return [];
  }
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.items?.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url
    })) || [];
    
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
}