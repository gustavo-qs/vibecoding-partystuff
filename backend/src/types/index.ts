// Tipos TypeScript para o sistema de karaoke

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

export interface UserSession {
  session_id: string;
  username: string;
  role: 'host' | 'user';
  device_type: 'mobile' | 'desktop' | 'tablet';
  connected_at: string;
  last_activity: string;
  songs_added: number;
}

export interface QueueState {
  current_song: string | null;
  current_song_started_at: string | null;
  queue: string[];
  total_songs: number;
  queue_duration: string;
}

export interface HostKey {
  key: string;
  created_at: string;
  expires_at: string;
}

export interface AddSongRequest {
  youtube_url: string;
  title?: string;
  added_by?: string;
  user_fingerprint?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
