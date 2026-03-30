// src/hooks/useAuth.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAuthenticated, getUserData, clearAuthData } from '../utils/tokenStorage';
import { login as loginService, logout as logoutService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
   
  // Restore session from localStorage on mount
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUserData());
    }
    setLoading(false);
  }, []);

  // Listen for forced logout events (e.g., from axios interceptor on 401)
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginService(email, password);
    setUser(getUserData());
    return data;
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
