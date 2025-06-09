import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
  phone: string;
}

interface AuthResponse {
  token: string;
  fullname: string;
  role: string;
  id: number;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const result = await api.post('/auth/login', data);
      console.log('Login response:', result);
      
      // Simpan token ke AsyncStorage
      await AsyncStorage.setItem('token', result.token);
      
      // Simpan data user dengan format yang sesuai
      const userData = {
        id: result.id || 1, // Fallback ke 1 jika id tidak ada
        name: result.fullname,
        email: data.email,
      };
      console.log('Saving user data:', userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const result = await api.post('/auth/register', data);
      console.log('Register response:', result);
      
      // Simpan token ke AsyncStorage
      await AsyncStorage.setItem('token', result.token);
      
      // Simpan data user dengan format yang sesuai
      const userData = {
        id: result.id || 1, // Fallback ke 1 jika id tidak ada
        name: result.fullname,
        email: data.email,
      };
      console.log('Saving user data:', userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      return result;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      console.log('Logging out...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Getting token:', token);
      return token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  async getUserData(): Promise<{ id: number; name: string; email: string } | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      console.log('Getting user data:', userData);
      if (!userData) return null;
      
      const parsed = JSON.parse(userData);
      // Pastikan data memiliki format yang benar
      if (!parsed.id || !parsed.name || !parsed.email) {
        console.error('Invalid user data format:', parsed);
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  },
}; 