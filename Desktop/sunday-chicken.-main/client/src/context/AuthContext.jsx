import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { storage } from '@/utils';
import { STORAGE_KEYS } from '@/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => storage.get(STORAGE_KEYS.USER));
  const [loading, setLoading] = useState(true);
  const [token,   setToken]   = useState(() => storage.get(STORAGE_KEYS.AUTH_TOKEN));

  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await authService.me();
        const u = res?.data?.user || res?.user;
        if (u) {
          setUser(u);
          storage.set(STORAGE_KEYS.USER, u);
        }
      } catch {
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.USER);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    // Handle both {data: {user, token}} and {user, token} response shapes
    const user  = res?.data?.user  || res?.user;
    const token = res?.data?.token || res?.token;
    if (!user || !token) throw new Error('Invalid response from server');
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    storage.set(STORAGE_KEYS.USER, user);
    setToken(token);
    setUser(user);
    return { user, token };
  }, []);

  const register = useCallback(async (userData) => {
    const res = await authService.register(userData);
    const user  = res?.data?.user  || res?.user;
    const token = res?.data?.token || res?.token;
    if (!user || !token) throw new Error('Invalid response from server');
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    storage.set(STORAGE_KEYS.USER, user);
    setToken(token);
    setUser(user);
    return { user, token };
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
