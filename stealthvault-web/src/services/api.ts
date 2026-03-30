import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  BaseResponse,
  Secret,
  CreateSecretRequest,
  UpdateSecretRequest,
  UpdatePasswordRequest,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      mode: 'cors',
    });

    if (response.status === 401) {
      this.token = null;
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || errorData?.errorMessage || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return response.json();
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<BaseResponse> {
    return this.request<BaseResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<BaseResponse> {
    return this.request<BaseResponse>('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Secrets endpoints
  async getSecrets(): Promise<Secret[]> {
    return this.request<Secret[]>('/secrets');
  }

  async createSecret(data: CreateSecretRequest): Promise<BaseResponse> {
    return this.request<BaseResponse>('/secrets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSecret(id: string, data: UpdateSecretRequest): Promise<BaseResponse> {
    return this.request<BaseResponse>(`/secrets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSecret(id: string): Promise<BaseResponse> {
    return this.request<BaseResponse>(`/secrets/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
