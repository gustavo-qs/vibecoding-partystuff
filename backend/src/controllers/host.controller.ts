import { Request, Response } from 'express';
import { HostService } from '../services/host.service';
import { QueueService } from '../services/queue.service';
import { ApiResponse } from '../types';
import { validateHostKey } from '../utils/validation';

export class HostController {
  private hostService = new HostService();
  private queueService = new QueueService();

  async generateKey(req: Request, res: Response): Promise<void> {
    try {
      const key = await this.hostService.createHostKey();
      const response: ApiResponse<{ key: string }> = {
        success: true,
        data: { key },
        message: 'Host key generated successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error generating host key:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to generate host key'
      };
      res.status(500).json(response);
    }
  }

  async validateKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.body;

      // Validate input
      const { error } = validateHostKey({ key });
      if (error) {
        const response: ApiResponse = {
          success: false,
          error: error.details[0].message
        };
        res.status(400).json(response);
        return;
      }

      const isValid = await this.hostService.validateHostKey(key);
      const response: ApiResponse<{ valid: boolean }> = {
        success: true,
        data: { valid: isValid },
        message: isValid ? 'Valid host key' : 'Invalid host key'
      };
      res.json(response);
    } catch (error) {
      console.error('Error validating host key:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to validate host key'
      };
      res.status(500).json(response);
    }
  }

  async skipSong(req: Request, res: Response): Promise<void> {
    try {
      const nextSong = await this.queueService.skipCurrentSong();
      const response: ApiResponse = {
        success: true,
        data: { next_song: nextSong },
        message: 'Song skipped successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error skipping song:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to skip song'
      };
      res.status(500).json(response);
    }
  }

  async removeSong(req: Request, res: Response): Promise<void> {
    try {
      const { songId } = req.params;
      await this.queueService.removeSong(songId);

      const response: ApiResponse = {
        success: true,
        message: 'Song removed successfully'
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

  async getCurrentKey(req: Request, res: Response): Promise<void> {
    try {
      const key = await this.hostService.getCurrentHostKey();

      if (!key) {
        const response: ApiResponse = {
          success: false,
          error: 'No active host key'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<{ key: string }> = {
        success: true,
        data: { key }
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting current host key:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get host key'
      };
      res.status(500).json(response);
    }
  }

  async renewKey(req: Request, res: Response): Promise<void> {
    try {
      const key = await this.hostService.renewHostKey();

      if (!key) {
        const response: ApiResponse = {
          success: false,
          error: 'No active host key to renew'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<{ key: string }> = {
        success: true,
        data: { key },
        message: 'Host key renewed successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error renewing host key:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to renew host key'
      };
      res.status(500).json(response);
    }
  }
}
