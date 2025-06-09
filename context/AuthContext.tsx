import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user data from storage on mount
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      console.log('Loading user data from storage:', userData);
      
      if (userData) {
        const parsed = JSON.parse(userData);
        console.log('Parsed user data:', parsed);
        
        // Validasi format data user
        if (parsed.id && parsed.name && parsed.email) {
          setUser({
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
          });
        } else {
          console.error('Invalid user data format:', parsed);
          // Jangan hapus data jika format tidak sesuai
          // Biarkan user tetap login dengan data yang ada
          setUser({
            id: parsed.id || 1,
            name: parsed.name || parsed.fullname || 'User',
            email: parsed.email || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Jangan hapus data jika terjadi error
      // Biarkan user tetap login
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      console.log('Logging in with user data:', userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  };

  if (isLoading) {
    return null; // atau loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 