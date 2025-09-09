import { CONFIG } from '../config/constants';

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  contentDetails?: {
    duration: string;
  };
}

interface YouTubeApiResponse {
  items: YouTubeVideoItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export class YouTubeService {
  private static readonly API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

  static extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  static getThumbnailUrl(youtubeId: string): string {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }

  static getEmbedUrl(youtubeId: string): string {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  static isValidYouTubeUrl(url: string): boolean {
    return this.extractYouTubeId(url) !== null;
  }

  static async getVideoMetadata(youtubeId: string): Promise<{
    title: string;
    channel: string;
    duration: string;
  } | null> {
    if (!CONFIG.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured, returning placeholder data');
      return {
        title: 'Unknown Title',
        channel: 'Unknown Channel',
        duration: '00:00:00'
      };
    }

    try {
      // Get video details including snippet and content details
      const response = await fetch(
        `${this.API_BASE_URL}/videos?id=${youtubeId}&key=${CONFIG.YOUTUBE_API_KEY}&part=snippet,contentDetails`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data: YouTubeApiResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = data.items[0];
      const duration = this.parseDuration(video.contentDetails?.duration || 'PT0S');

      return {
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        duration: duration
      };

    } catch (error) {
      console.error('Error fetching YouTube metadata:', error);

      // Fallback to placeholder data
      return {
        title: 'Unknown Title',
        channel: 'Unknown Channel',
        duration: '00:00:00'
      };
    }
  }

  private static parseDuration(duration: string): string {
    // Parse ISO 8601 duration format (PT4M13S) to HH:MM:SS
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) return '00:00:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    if (hours > 0) {
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
      return `${formattedMinutes}:${formattedSeconds}`;
    }
  }
}
