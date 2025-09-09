// Core Types for Karaoke System

export interface Song {
  id: string;
  youtube_id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail_url: string;
  youtube_url: string;
  added_by: string;
  user_fingerprint: string;
  added_at: string;
  status: 'queued' | 'playing' | 'played';
}

export interface QueueState {
  current_song: string | null;
  current_song_started_at: string | null;
  queue: string[];
  total_songs: number;
  queue_duration: string;
}

export interface UserSession {
  session_id: string;
  username: string;
  role: 'host' | 'user';
  device_type: 'mobile' | 'desktop' | 'tablet';
  connected_at: string;
  last_activity: string;
  songs_added: number;
}

export interface HostKey {
  key: string;
  created_at: string;
  expires_at: string;
}

export interface AddSongRequest {
  youtube_url: string;
  title?: string;
  added_by: string;
  user_fingerprint?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface WebSocketEvents {
  'join-queue': (data: { userId: string }) => void;
  'song-added': (data: { userId: string }) => void;
  'host-control': (data: { action: string; songId?: string }) => void;
  'request-queue-update': () => void;
  'queue-update': (data: { queueState: QueueState; songs: Song[]; timestamp: string }) => void;
}

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  url: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  type?: 'error' | 'warning' | 'info';
}

// Form Types
export interface SearchFormData {
  query: string;
  type: 'url' | 'search';
}

export interface HostAuthFormData {
  key: string;
}
