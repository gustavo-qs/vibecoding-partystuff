import { RedisService } from './redis.service';
import { Song, QueueState } from '../types';

export class QueueService {
  private redis = RedisService.getInstance();

  async addSong(song: Song): Promise<void> {
    await this.redis.saveSong(song);
    await this.redis.addToQueue(song.id);
  }

  async removeSong(songId: string): Promise<void> {
    await this.redis.removeFromQueue(songId);
    await this.redis.deleteSong(songId);
  }

  async getCurrentSong(): Promise<Song | null> {
    const queue = await this.redis.getQueue();
    if (queue.length === 0) return null;

    const currentSongId = queue[0];
    return await this.redis.getSong(currentSongId);
  }

  async skipCurrentSong(): Promise<Song | null> {
    const currentSong = await this.getCurrentSong();
    if (currentSong) {
      await this.redis.removeFromQueue(currentSong.id);
    }
    return await this.getCurrentSong();
  }

  async getQueueState(): Promise<QueueState> {
    const queue = await this.redis.getQueue();
    const totalSongs = queue.length;

    // Calculate total duration (simplified - would need to sum actual durations)
    let queueDuration = '00:00:00';

    return {
      current_song: queue.length > 0 ? queue[0] : null,
      current_song_started_at: null, // Would be set when song starts playing
      queue: queue,
      total_songs: totalSongs,
      queue_duration: queueDuration
    };
  }

  async getAllSongs(): Promise<Song[]> {
    return await this.redis.getAllSongs();
  }

  async clearQueue(): Promise<void> {
    const songs = await this.getAllSongs();

    // Remove all songs from queue
    await this.redis.clearQueue();

    // Delete all song metadata
    for (const song of songs) {
      await this.redis.deleteSong(song.id);
    }
  }

  async moveSong(songId: string, newPosition: number): Promise<boolean> {
    const queue = await this.redis.getQueue();
    const currentIndex = queue.indexOf(songId);

    if (currentIndex === -1 || newPosition < 0 || newPosition >= queue.length) {
      return false;
    }

    // Remove song from current position
    queue.splice(currentIndex, 1);

    // Insert at new position
    queue.splice(newPosition, 0, songId);

    // Clear and rebuild queue
    await this.redis.clearQueue();
    for (const id of queue) {
      await this.redis.addToQueue(id);
    }

    return true;
  }
}
