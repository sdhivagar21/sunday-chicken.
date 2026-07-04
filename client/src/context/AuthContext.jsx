import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { storage } from '@/utils';
import { STORAGE_KEYS } from '@/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => storage.get(STORAGE_KEYS.USER));
  const [loading, setLoading] = useState(true);
  const [token, setToken]     = useState(() => storage.get(STORAGE_KEYS.AUTH_TOKEN));

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authService.me();
        setUser(data.user);
        storage.set(STORAGE_KEYS.USER, data.user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);
    storage.set(STORAGE_KEYS.AUTH_TOKEN, data.token);
    storage.set(STORAGE_KEYS.USER, data.user);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authService.register(userData);
    storage.set(STORAGE_KEYS.AUTH_TOKEN, data.token);
    storage.set(STORAGE_KEYS.USER, data.user);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token && user);
  const isAdmin         = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
