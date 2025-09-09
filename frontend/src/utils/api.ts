import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  ApiResponse,
  Song,
  QueueState,
  AddSongRequest,
  GetQueueResponse,
  GetSongsResponse,
  AddSongResponse,
  GenerateHostKeyResponse,
  ValidateHostKeyRequest,
  ValidateHostKeyResponse,
  SkipSongResponse,
  RemoveSongResponse
} from '@/types/api'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const API_TIMEOUT = 10000

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth headers here if needed
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('API Response Error:', error)
        return Promise.reject(error)
      }
    )
  }

  // Songs API
  async getQueue(): Promise<QueueState> {
    const response = await this.client.get<GetQueueResponse>('/api/songs/queue')
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get queue')
    }
    return response.data.data!
  }

  async getSongs(): Promise<Song[]> {
    const response = await this.client.get<GetSongsResponse>('/api/songs')
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get songs')
    }
    return response.data.data!
  }

  async getSong(songId: string): Promise<Song> {
    const response = await this.client.get<ApiResponse<Song>>(`/api/songs/${songId}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get song')
    }
    return response.data.data!
  }

  async addSong(songData: AddSongRequest): Promise<Song> {
    const response = await this.client.post<AddSongResponse>('/api/songs', songData)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to add song')
    }
    return response.data.data!
  }

  async removeSong(songId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse>(`/api/songs/${songId}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to remove song')
    }
  }

  // Host API
  async generateHostKey(): Promise<string> {
    const response = await this.client.post<GenerateHostKeyResponse>('/api/host/key')
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate host key')
    }
    return response.data.data!.key
  }

  async validateHostKey(key: string): Promise<boolean> {
    const response = await this.client.post<ValidateHostKeyResponse>('/api/host/validate', { key } as ValidateHostKeyRequest)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to validate host key')
    }
    return response.data.data!.valid
  }

  async skipSong(): Promise<Song | null> {
    const response = await this.client.post<SkipSongResponse>('/api/host/skip')
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to skip song')
    }
    return response.data.data!.next_song
  }

  async removeSongAsHost(songId: string): Promise<void> {
    const response = await this.client.delete<ApiResponse>(`/api/host/songs/${songId}`)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to remove song')
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    const response = await this.client.get<{ status: string; timestamp: string; uptime: number }>('/health')
    return response.data
  }

  // Generic request method
  async request<T = any>(config: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    url: string
    data?: any
    params?: any
  }): Promise<T> {
    const response = await this.client.request<ApiResponse<T>>(config)
    if (!response.data.success) {
      throw new Error(response.data.error || 'API request failed')
    }
    return response.data.data!
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient()
export default apiClient
