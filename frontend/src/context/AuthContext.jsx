import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken, getStoredUser, setStoredUser, removeStoredUser } from '../api/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = getToken();
    const stored = getStoredUser();
    return (token && stored) ? stored : null;
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      removeToken();
      removeStoredUser();
      addToast('Your session has expired. Please log in again.', 'warning');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [addToast]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          setStoredUser(profile);
        } catch (err) {
          console.warn("Session expired or invalid token:", err);
          removeToken();
          removeStoredUser();
          setUser(null);
        }
      } else {
        removeStoredUser();
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login({ email, password });
      setToken(data.access_token);
      setUser(data.user);
      setStoredUser(data.user);
      addToast(`Welcome back, ${data.user.full_name}!`, 'success');
      return data.user;
    } catch (err) {
      addToast(err.message || 'Login failed. Please check credentials.', 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.register(userData);
      setToken(data.access_token);
      setUser(data.user);
      setStoredUser(data.user);
      addToast(`Account created successfully! Welcome to the platform.`, 'success');
      return data.user;
    } catch (err) {
      addToast(err.message || 'Registration failed.', 'error');
      throw err;
    }
  };

  const logout = () => {
    removeToken();
    removeStoredUser();
    setUser(null);
    addToast('You have been logged out safely.', 'info');
  };

  const refreshUser = async () => {
    try {
      const profile = await api.getMe();
      setUser(profile);
      setStoredUser(profile);
      return profile;
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user && getToken()),
    isDonor: user?.role === 'DONOR',
    isNgo: user?.role === 'NGO',
    isBeneficiary: user?.role === 'BENEFICIARY',
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
