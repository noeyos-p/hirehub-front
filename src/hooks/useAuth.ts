// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import api from '../api/api';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  nickname: string;
  phone: string;
  role: string;
  requiresOnboarding: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('인증 확인 실패:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string) => {
    localStorage.setItem('token', token);
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth
  };
};