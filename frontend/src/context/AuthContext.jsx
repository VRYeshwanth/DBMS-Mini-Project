import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state by verifying token with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res && res.success && res.data) {
            setUser(res.data);
          } else {
            // Invalid response
            handleLogout();
          }
        } catch (err) {
          console.warn('Auth check failed:', err?.response?.data?.message || err.message);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res && res.success && res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);

      // Fetch complete user profile including customer info if applicable
      try {
        const userRes = await authService.getCurrentUser();
        const fullUser = userRes?.data || res.user;
        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser));
        return { success: true, user: fullUser };
      } catch {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
    }
    return { success: false, message: res?.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    return res;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const logout = () => {
    handleLogout();
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    login,
    register,
    logout,
    refreshUser: async () => {
      try {
        const res = await authService.getCurrentUser();
        if (res?.data) setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    }
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

export default AuthContext;
