import { redisClient } from '../config/redis';
import { Song } from '../types';

export class RedisService {
  private static instance: RedisService;

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      try {
        RedisService.instance = new RedisService();
        console.log('✅ RedisService singleton instance created');
      } catch (error) {
        console.error('❌ Failed to create RedisService instance:', error);
        throw error;
      }
    }
    return RedisService.instance;
  }

  constructor() {
    // Basic check if Redis client is available
    if (!redisClient) {
      throw new Error('Redis client not initialized');
    }
    console.log('✅ RedisService constructor completed');
  }

  // Queue operations
  async addToQueue(songId: string): Promise<void> {
    try {
      await redisClient.rPush('karaoke:queue', songId);
    } catch (error) {
      console.error('❌ Redis addToQueue failed:', error);
      throw error;
    }
  }

  async removeFromQueue(songId: string): Promise<void> {
    await redisClient.lRem('karaoke:queue', 0, songId);
  }

  async getQueue(): Promise<string[]> {
    return await redisClient.lRange('karaoke:queue', 0, -1);
  }

  async getQueueLength(): Promise<number> {
    return await redisClient.lLen('karaoke:queue');
  }

  async clearQueue(): Promise<void> {
    await redisClient.del('karaoke:queue');
  }

  // Song metadata operations
  async saveSong(song: Song): Promise<void> {
    const songData = {
      id: song.id,
      youtube_id: song.youtube_id,
      title: song.title,
      channel: song.channel,
      duration: song.duration,
      thumbnail_url: song.thumbnail_url,
      youtube_url: song.youtube_url,
      added_by: song.added_by,
      user_fingerprint: song.user_fingerprint,
      added_at: song.added_at,
      status: song.status
    };
    await redisClient.hSet(`karaoke:song:${song.id}`, songData);
    // Set expiration for song metadata (24 hours)
    await redisClient.expire(`karaoke:song:${song.id}`, 86400);
  }

  async getSong(songId: string): Promise<Song | null> {
    const song = await redisClient.hGetAll(`karaoke:song:${songId}`);
    return Object.keys(song).length ? song as unknown as Song : null;
  }

  async deleteSong(songId: string): Promise<void> {
    await redisClient.del(`karaoke:song:${songId}`);
  }

  async getAllSongs(): Promise<Song[]> {
    const queue = await this.getQueue();
    const songs: Song[] = [];

    for (const songId of queue) {
      const song = await this.getSong(songId);
      if (song) {
        songs.push(song);
      }
    }

    return songs;
  }

  // Host key management
  async setHostKey(key: string, ttl: number = 3600): Promise<void> {
    await redisClient.setEx('karaoke:host_key', ttl, key);
  }

  async getHostKey(): Promise<string | null> {
    return await redisClient.get('karaoke:host_key');
  }

  async deleteHostKey(): Promise<void> {
    await redisClient.del('karaoke:host_key');
  }

  async validateHostKey(key: string): Promise<boolean> {
    const storedKey = await this.getHostKey();
    return storedKey === key;
  }

  // Current playing song
  async setCurrentSong(songId: string): Promise<void> {
    await redisClient.set('karaoke:current_song', songId);
  }

  async getCurrentSong(): Promise<string | null> {
    return await redisClient.get('karaoke:current_song');
  }

  async clearCurrentSong(): Promise<void> {
    await redisClient.del('karaoke:current_song');
  }

  // Session management
  async setSessionData(sessionId: string, data: any): Promise<void> {
    await redisClient.hSet(`karaoke:session:${sessionId}`, data as Record<string, string>);
    await redisClient.expire(`karaoke:session:${sessionId}`, 86400); // 24 hours
  }

  async getSessionData(sessionId: string): Promise<any> {
    const data = await redisClient.hGetAll(`karaoke:session:${sessionId}`);
    return Object.keys(data).length ? data : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await redisClient.del(`karaoke:session:${sessionId}`);
  }
}
