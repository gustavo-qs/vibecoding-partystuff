// API Types for Backend Communication

import { Song, QueueState, HostKey, ApiResponse } from './index';

// Songs API
export interface GetQueueResponse extends ApiResponse<QueueState> {}

export interface GetSongsResponse extends ApiResponse<Song[]> {}

export interface GetSongResponse extends ApiResponse<Song> {}

export interface AddSongRequest {
  youtube_url: string;
  title?: string;
  added_by: string;
  user_fingerprint?: string;
}

export interface AddSongResponse extends ApiResponse<Song> {}

// Host API
export interface GenerateHostKeyResponse extends ApiResponse<HostKey> {}

export interface ValidateHostKeyRequest {
  key: string;
}

export interface ValidateHostKeyResponse extends ApiResponse<{ valid: boolean }> {}

export interface SkipSongResponse extends ApiResponse<{ next_song: Song | null }> {}

export interface RemoveSongResponse extends ApiResponse<{ message: string }> {}

// WebSocket Message Types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
}

export interface JoinQueueMessage {
  userId: string;
}

export interface SongAddedMessage {
  userId: string;
}

export interface HostControlMessage {
  action: 'skip' | 'remove' | 'play' | 'pause';
  songId?: string;
}

export interface QueueUpdateMessage {
  queueState: QueueState;
  songs: Song[];
  timestamp: string;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError extends ApiError {
  field: string;
  value: any;
}

// HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface WebSocketConfig {
  url: string;
  options: {
    autoConnect: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
  };
}
