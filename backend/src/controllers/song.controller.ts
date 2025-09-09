import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service';
import { YouTubeService } from '../services/youtube.service';
import { Song, ApiResponse } from '../types';
import { validateSongData } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

export class SongController {
  private queueService: QueueService | null = null;

  private async getQueueService(): Promise<QueueService> {
    if (!this.queueService) {
      try {
        this.queueService = new QueueService();
        console.log('✅ QueueService initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize QueueService:', error);
        throw new Error('Queue service is not available. Please check Redis connection.');
      }
    }
    return this.queueService;
  }

  async addSong(req: Request, res: Response): Promise<void> {
    try {
      const { youtube_url, title, added_by, user_fingerprint } = req.body;

      // Validate input
      const { error } = validateSongData(req.body);
      if (error) {
        const response: ApiResponse = {
          success: false,
          error: error.details[0].message
        };
        res.status(400).json(response);
        return;
      }

      // Extract YouTube ID from URL
      const youtube_id = YouTubeService.extractYouTubeId(youtube_url);
      if (!youtube_id) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid YouTube URL'
        };
        res.status(400).json(response);
        return;
      }

      // Get video metadata (placeholder for now)
      const metadata = await YouTubeService.getVideoMetadata(youtube_id);

      const song: Song = {
        id: uuidv4(),
        youtube_id,
        title: title || metadata?.title || 'Unknown Title',
        channel: metadata?.channel || 'Unknown Channel',
        duration: metadata?.duration || '00:00:00',
        thumbnail_url: YouTubeService.getThumbnailUrl(youtube_id),
        youtube_url,
        added_by: added_by || 'anonymous',
        user_fingerprint: user_fingerprint || '',
        added_at: new Date().toISOString(),
        status: 'queued'
      };

      const queueService = await this.getQueueService();
      await queueService.addSong(song);

      const response: ApiResponse<Song> = {
        success: true,
        data: song,
        message: 'Song added to queue successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error adding song:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to add song'
      };
      res.status(500).json(response);
    }
  }

  async getQueue(req: Request, res: Response): Promise<void> {
    try {
      const queueService = await this.getQueueService();
      const queueState = await queueService.getQueueState();
      const response: ApiResponse = {
        success: true,
        data: queueState
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting queue:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get queue'
      };
      res.status(500).json(response);
    }
  }

  async getSong(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const queueService = await this.getQueueService();
      const queue = await queueService.getAllSongs();
      const song = queue.find(s => s.id === id);

      if (!song) {
        const response: ApiResponse = {
          success: false,
          error: 'Song not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Song> = {
        success: true,
        data: song
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting song:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get song'
      };
      res.status(500).json(response);
    }
  }

  async removeSong(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const queueService = await this.getQueueService();
      await queueService.removeSong(id);

      const response: ApiResponse = {
        success: true,
        message: 'Song removed from queue'
      };
      res.json(response);
    } catch (error) {
      console.error('Error removing song:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to remove song'
      };
      res.status(500).json(response);
    }
  }

  async getAllSongs(req: Request, res: Response): Promise<void> {
    try {
      const queueService = await this.getQueueService();
      const songs = await queueService.getAllSongs();
      const response: ApiResponse<Song[]> = {
        success: true,
        data: songs
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting all songs:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get songs'
      };
      res.status(500).json(response);
    }
  }
}
