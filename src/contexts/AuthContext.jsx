"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const checkAuthStatus = () => {
    try {
      // Check if we're in the browser (not SSR)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('userData');
        
        if (token) {
          setIsAuthenticated(true);
          setIsLogin(true);
          
          // Parse and set user data if available
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.error('Error parsing user data:', e);
              setUser(null);
            }
          }
        } else {
          setIsAuthenticated(false);
          setIsLogin(false);
          setUser(null);
        }
      } else {
        // During SSR, assume not authenticated
        setIsAuthenticated(false);
        setIsLogin(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setIsLogin(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData = null) => {
    if (typeof window !== 'undefined') {
      // Store token
      localStorage.setItem('token', token);
      
      // Store user data
      if (userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
      }
    }
    setIsAuthenticated(true);
    setIsLogin(true);
    setUser(userData);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
    setIsAuthenticated(false);
    setIsLogin(false);
    setUser(null);
    router.push('/');
  };

  useEffect(() => {
    setMounted(true);
    
    // Use a small delay to ensure proper initialization
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 50);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const value = {
    isAuthenticated,
    isLogin,
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};