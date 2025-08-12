// YouTube Data API integration and video categorization utilities

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  categoryId: number;
  categoryName: string;
  channelTitle: string;
  description: string;
  tags: string[];
  publishedAt: string;
}

export interface CategoryInfo {
  id: number;
  name: string;
  isEducational: boolean;
}

// Educational categories based on YouTube's official category IDs
const EDUCATIONAL_CATEGORIES: CategoryInfo[] = [
  { id: 27, name: "Education", isEducational: true },
  { id: 28, name: "Science & Technology", isEducational: true },
  { id: 25, name: "News & Politics", isEducational: true },
  { id: 22, name: "People & Blogs", isEducational: false }, // Can be educational
  { id: 26, name: "Howto & Style", isEducational: true },
  { id: 1, name: "Film & Animation", isEducational: false },
  { id: 2, name: "Autos & Vehicles", isEducational: false },
  { id: 10, name: "Music", isEducational: false },
  { id: 15, name: "Pets & Animals", isEducational: false },
  { id: 17, name: "Sports", isEducational: false },
  { id: 18, name: "Short Movies", isEducational: false },
  { id: 19, name: "Travel & Events", isEducational: false },
  { id: 20, name: "Gaming", isEducational: false },
  { id: 21, name: "Videoblogging", isEducational: false },
  { id: 23, name: "Comedy", isEducational: false },
  { id: 24, name: "Entertainment", isEducational: false },
  { id: 29, name: "Nonprofits & Activism", isEducational: true },
];

// Study-related keywords for NLP enhancement
const STUDY_KEYWORDS = [
  'tutorial', 'lecture', 'course', 'lesson', 'learn', 'education', 'study',
  'university', 'college', 'school', 'academic', 'research', 'analysis',
  'explanation', 'how to', 'guide', 'training', 'certification', 'exam',
  'mathematics', 'science', 'physics', 'chemistry', 'biology', 'programming',
  'coding', 'computer science', 'engineering', 'medicine', 'law', 'business',
  'economics', 'history', 'literature', 'philosophy', 'psychology',
  'documentation', 'review', 'summary', 'notes', 'preparation'
];

const FUN_KEYWORDS = [
  'entertainment', 'funny', 'comedy', 'gaming', 'game', 'music', 'song',
  'dance', 'party', 'fun', 'joke', 'meme', 'viral', 'trending', 'celebrity',
  'gossip', 'drama', 'movie', 'film', 'trailer', 'vlog', 'lifestyle',
  'travel', 'food', 'cooking', 'recipe', 'fashion', 'beauty', 'sports',
  'highlights', 'goals', 'wins', 'fails', 'compilation', 'reaction'
];

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Get category info by category ID
 */
export function getCategoryInfo(categoryId: number): CategoryInfo {
  return EDUCATIONAL_CATEGORIES.find(cat => cat.id === categoryId) || 
         { id: categoryId, name: "Unknown", isEducational: false };
}

/**
 * Check if a category is educational by default
 */
export function isEducationalCategory(categoryId: number): boolean {
  const category = getCategoryInfo(categoryId);
  return category.isEducational;
}

/**
 * Use NLP to analyze if content is study-related based on title and description
 */
export function analyzeContentForStudy(title: string, description: string, tags: string[] = []): {
  studyScore: number;
  funScore: number;
  isLikelyStudy: boolean;
} {
  const allText = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
  
  let studyScore = 0;
  let funScore = 0;
  
  // Count study-related keywords
  for (const keyword of STUDY_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = allText.match(regex) || [];
    studyScore += matches.length;
  }
  
  // Count fun-related keywords
  for (const keyword of FUN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = allText.match(regex) || [];
    funScore += matches.length;
  }
  
  // Normalize scores
  const totalWords = allText.split(/\s+/).length;
  const normalizedStudyScore = (studyScore / totalWords) * 100;
  const normalizedFunScore = (funScore / totalWords) * 100;
  
  return {
    studyScore: normalizedStudyScore,
    funScore: normalizedFunScore,
    isLikelyStudy: normalizedStudyScore > normalizedFunScore && normalizedStudyScore > 0.5
  };
}

/**
 * Check if content is related to user's study area
 */
export function isRelatedToStudyArea(content: YouTubeVideoInfo, userStudyArea: string): boolean {
  const studyAreaLower = userStudyArea.toLowerCase();
  const allText = `${content.title} ${content.description} ${content.tags.join(' ')} ${content.channelTitle}`.toLowerCase();
  
  // Direct keyword matching
  if (allText.includes(studyAreaLower)) {
    return true;
  }
  
  // Subject-specific matching
  const subjectMappings: { [key: string]: string[] } = {
    'computer science': ['programming', 'coding', 'software', 'algorithm', 'data structure', 'web development', 'machine learning', 'ai'],
    'medical': ['medicine', 'anatomy', 'physiology', 'biology', 'health', 'doctor', 'medical school', 'mcat'],
    'law': ['legal', 'lawyer', 'court', 'law school', 'lsat', 'jurisprudence', 'constitutional'],
    'mathematics': ['math', 'calculus', 'algebra', 'geometry', 'statistics', 'mathematical'],
    'physics': ['physics', 'quantum', 'mechanics', 'thermodynamics', 'electromagnetic'],
    'chemistry': ['chemistry', 'chemical', 'organic', 'inorganic', 'biochemistry'],
    'business': ['business', 'management', 'marketing', 'finance', 'economics', 'mba'],
    'engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'chemical engineering'],
    'psychology': ['psychology', 'behavioral', 'cognitive', 'mental health', 'therapy']
  };
  
  const relatedKeywords = subjectMappings[studyAreaLower] || [];
  for (const keyword of relatedKeywords) {
    if (allText.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Fallback method to get video info when API is not available
 */
export async function getVideoInfoFallback(videoId: string): Promise<Partial<YouTubeVideoInfo> | null> {
  try {
    // Try to get info from the current page if we're on YouTube
    if (window.location.hostname.includes('youtube.com')) {
      const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer .style-scope.ytd-video-primary-info-renderer') ||
                           document.querySelector('h1.title .style-scope.ytd-video-primary-info-renderer') ||
                           document.querySelector('[data-e2e="video-title"]') ||
                           document.querySelector('h1');
      
      const channelElement = document.querySelector('.ytd-channel-name a') ||
                            document.querySelector('.yt-user-info a') ||
                            document.querySelector('[data-e2e="video-author"]');
      
      const title = titleElement?.textContent?.trim() || 'Unknown Video';
      const channelTitle = channelElement?.textContent?.trim() || 'Unknown Channel';
      
      return {
        id: videoId,
        title,
        channelTitle,
        categoryId: 0, // Unknown category
        categoryName: 'Unknown',
        description: '',
        tags: [],
        publishedAt: new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in fallback video info extraction:', error);
    return null;
  }
}

/**
 * Get video information using YouTube Data API v3
 */
export async function getVideoInfo(videoId: string, apiKey?: string): Promise<YouTubeVideoInfo | null> {
  // First try fallback method
  const fallbackInfo = await getVideoInfoFallback(videoId);
  
  if (!apiKey) {
    console.warn('No YouTube API key provided, using fallback method only');
    return fallbackInfo as YouTubeVideoInfo | null;
  }
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.warn('Video not found in API response, using fallback');
      return fallbackInfo as YouTubeVideoInfo | null;
    }
    
    const item = data.items[0];
    const snippet = item.snippet;
    
    return {
      id: videoId,
      title: snippet.title || 'Unknown Title',
      categoryId: parseInt(snippet.categoryId) || 0,
      categoryName: getCategoryInfo(parseInt(snippet.categoryId)).name,
      channelTitle: snippet.channelTitle || 'Unknown Channel',
      description: snippet.description || '',
      tags: snippet.tags || [],
      publishedAt: snippet.publishedAt || new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error fetching video info from API:', error);
    return fallbackInfo as YouTubeVideoInfo | null;
  }
}

/**
 * Determine if a video should be classified as study or fun
 */
export async function classifyVideo(
  videoId: string, 
  userStudyArea: string,
  apiKey?: string
): Promise<{
  videoInfo: YouTubeVideoInfo | null;
  isEducationalCategory: boolean;
  isRelatedToStudyArea: boolean;
  nlpAnalysis: ReturnType<typeof analyzeContentForStudy>;
  recommendedClassification: 'study' | 'fun' | 'ask_user';
}> {
  const videoInfo = await getVideoInfo(videoId, apiKey);
  
  if (!videoInfo) {
    return {
      videoInfo: null,
      isEducationalCategory: false,
      isRelatedToStudyArea: false,
      nlpAnalysis: { studyScore: 0, funScore: 0, isLikelyStudy: false },
      recommendedClassification: 'ask_user'
    };
  }
  
  const isEducationalCat = isEducationalCategory(videoInfo.categoryId);
  const isRelatedToStudy = isRelatedToStudyArea(videoInfo, userStudyArea);
  const nlpAnalysis = analyzeContentForStudy(videoInfo.title, videoInfo.description, videoInfo.tags);
  
  // Classification logic
  let recommendedClassification: 'study' | 'fun' | 'ask_user' = 'ask_user';
  
  // Strong indicators for study content
  if (isEducationalCat && (isRelatedToStudy || nlpAnalysis.isLikelyStudy)) {
    recommendedClassification = 'study';
  }
  // Strong indicators for fun content
  else if (!isEducationalCat && nlpAnalysis.funScore > nlpAnalysis.studyScore && nlpAnalysis.funScore > 1) {
    recommendedClassification = 'fun';
  }
  // When in doubt, ask the user
  else {
    recommendedClassification = 'ask_user';
  }
  
  return {
    videoInfo,
    isEducationalCategory: isEducationalCat,
    isRelatedToStudyArea: isRelatedToStudy,
    nlpAnalysis,
    recommendedClassification
  };
}