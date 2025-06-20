// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authAPI from '../api/auth';

interface User {
  id: number;
  name: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  signup: (userData: { name: string; email: string; password: string }) => Promise<any>;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user profile when token exists
    const loadUser = async () => {
      if (token) {
        try {
          // Try to get user info from the token directly
          const userData = await authAPI.getProfile(token);
          setCurrentUser(userData);
        } catch (err) {
          console.warn('Could not get user profile, using default user');
          // Create a minimal user object so the app can function
          setCurrentUser({ id: 0, name: 'User', email: '' });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const signup = async (userData: { name: string; email: string; password: string }) => {
    setError(null);
    try {
      const response = await authAPI.signup(userData);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      setCurrentUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      throw err;
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      setCurrentUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    token,
    loading,
    error,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};