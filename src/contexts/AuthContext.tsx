// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import authAPI from "../api/auth";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  [key: string]: unknown;
}

interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  daily_commitment: number;
  learning_goal: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  signup: (userData: CreateUserRequest) => Promise<{ message: string }>;
  verifyOtp: (
    otpData: VerifyOTPRequest
  ) => Promise<{ token: string; user: Record<string, unknown> }>;
  resendOtp: (email: string) => Promise<{ message: string }>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (resetData: {
    email: string;
    otp: string;
    password: string;
  }) => Promise<{ message: string }>;
  googleLogin: (
    token: string
  ) => Promise<{ token: string; user: Record<string, unknown> }>;
  login: (credentials: LoginRequest) => Promise<unknown>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user profile when token exists
    const loadUser = async () => {
      if (token) {
        try {
          // Try to get user info from the token directly
          const userData = await authAPI.getProfile(token);
          setCurrentUser(userData as User);
        } catch (err) {
          console.warn("Could not get user profile, using default user");
          // Create a minimal user object so the app can function
          setCurrentUser({
            id: 0,
            first_name: "User",
            last_name: "",
            email: "",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const signup = async (userData: CreateUserRequest) => {
    setError(null);
    try {
      // Signup now just returns a message, no token
      const response = await authAPI.signup(userData);
      return response;
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to sign up");
      throw err;
    }
  };

  const verifyOtp = async (otpData: VerifyOTPRequest) => {
    setError(null);
    try {
      const response = await authAPI.verifyOtp(otpData);
      setToken(response.token);
      localStorage.setItem("token", response.token);
      setCurrentUser(response.user as User);
      return response;
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to verify OTP");
      throw err;
    }
  };

  const resendOtp = async (email: string) => {
    setError(null);
    try {
      const response = await authAPI.resendOtp(email);
      return response;
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to resend OTP");
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to send password reset email");
      throw err;
    }
  };

  const resetPassword = async (resetData: {
    email: string;
    otp: string;
    password: string;
  }) => {
    setError(null);
    try {
      const response = await authAPI.resetPassword(resetData);
      return response;
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to reset password");
      throw err;
    }
  };

  const googleLogin = async (token: string) => {
    setError(null);
    try {
      const response = await authAPI.googleLogin(token);
      setToken(response.token);
      localStorage.setItem("token", response.token);
      setCurrentUser(response.user as User);
      return response;
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to login with Google");
      throw err;
    }
  };

  const login = async (credentials: LoginRequest) => {
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      setToken(response.token);
      localStorage.setItem("token", response.token);
      setCurrentUser(response.user as User);
      return response;
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to log in");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    token,
    loading,
    error,
    signup,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    login,
    logout,
    googleLogin,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
