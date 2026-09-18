import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, NotificationItem } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  demoSwitch: (role: string) => Promise<void>;
  switchRole: (role: string) => Promise<void>;
  setupProfile: (data: any) => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchProfile = async () => {
    try {
      if (api.getToken()) {
        const data = await api.getMe();
        setUser(data.user);
        await refreshNotifications();
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    try {
      if (api.getToken()) {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
      }
    } catch (e) {
      // ignore in offline/initial mode
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    await refreshNotifications();
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setUser(res.user);
    await refreshNotifications();
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const demoSwitch = async (role: string) => {
    setLoading(true);
    try {
      const res = await api.demoSwitch(role);
      setUser(res.user);
      await refreshNotifications();
    } catch (err) {
      console.error('Demo switch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (role: string) => {
    setLoading(true);
    try {
      const res = await api.switchRole(role);
      setUser(res.user);
    } catch (err) {
      console.error('Role switch failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setupProfile = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.setupProfile(data);
      setUser(res.user);
    } catch (err) {
      console.error('Profile setup failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        demoSwitch,
        switchRole,
        setupProfile,
        notifications,
        unreadCount,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
