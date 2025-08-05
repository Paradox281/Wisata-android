import { Platform } from 'react-native';
import { authService } from './authService';

// Menggunakan IP yang sesuai berdasarkan platform
export const API_URL = Platform.OS === 'android' 
  ? 'https://altura.up.railway.app/api'  // Android emulator
  : 'https://altura.up.railway.app/api'; // iOS simulator

console.log('API URL:', API_URL);

export const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    try {
      const token = await authService.getToken();
      const url = `${API_URL}${endpoint}`;
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      console.log('Making API request to:', url);
      console.log('With headers:', headers);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired atau tidak valid
        await authService.logout();
        throw new Error('401');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async get(endpoint: string, options: RequestInit = {}) {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  },

  async post(endpoint: string, data: any, options: RequestInit = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put(endpoint: string, data: any, options: RequestInit = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint: string, options: RequestInit = {}) {
    return this.fetch(endpoint, { ...options, method: 'DELETE' });
  },
};

// Fungsi untuk upload multipart/form-data
export async function postMultipart(endpoint: string, formData: FormData) {
  const token = await authService.getToken();
  const url = `${API_URL}${endpoint}`;
  const headers: any = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Gagal upload data');
  }
  return response.json();
} 