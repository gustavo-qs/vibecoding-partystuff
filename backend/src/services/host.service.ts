import { RedisService } from './redis.service';
import crypto from 'crypto';

export class HostService {
  private redis = RedisService.getInstance();

  generateHostKey(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  async createHostKey(ttl: number = 3600): Promise<string> {
    const key = this.generateHostKey();
    await this.redis.setHostKey(key, ttl);
    return key;
  }

  async validateHostKey(key: string): Promise<boolean> {
    return await this.redis.validateHostKey(key);
  }

  async getCurrentHostKey(): Promise<string | null> {
    return await this.redis.getHostKey();
  }

  async renewHostKey(ttl: number = 3600): Promise<string | null> {
    const currentKey = await this.getCurrentHostKey();
    if (currentKey) {
      await this.redis.setHostKey(currentKey, ttl);
      return currentKey;
    }
    return null;
  }

  async deleteHostKey(): Promise<void> {
    await this.redis.deleteHostKey();
  }
}
