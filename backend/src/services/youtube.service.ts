export class YouTubeService {
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

  // Future: Add YouTube Data API integration for metadata
  static async getVideoMetadata(youtubeId: string): Promise<{
    title: string;
    channel: string;
    duration: string;
  } | null> {
    // This would require YouTube Data API v3
    // For now, return placeholder data
    return {
      title: 'Unknown Title',
      channel: 'Unknown Channel',
      duration: '00:00:00'
    };
  }
}
