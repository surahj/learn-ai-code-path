// src/api/auth.ts
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://ai-mentor-backend-w5gs.onrender.com";

interface DecodedToken {
  exp: number;
  user_id?: number;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

// Backend request interfaces
interface LoginRequest {
  email: string;
  password: string;
}

interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  daily_commitment: number;
  learning_goal: string;
}

// Backend response interfaces
interface ErrorResponse {
  error_code: number;
  error_message: string;
}

interface SuccessResponse {
  status: number;
  message: string;
  data: Record<string, unknown>;
}

interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  daily_commitment: number;
  learning_goal: string;
  created_at: string;
  updated_at: string;
}

const authAPI = {
  signup: async (
    userData: CreateUserRequest
  ): Promise<{ token: string; user: Record<string, unknown> }> => {
    try {
      const response = await axios.post<SuccessResponse>(
        `${API_URL}/signup`,
        userData
      );
      console.log("Signup response:", response.data);

      // Extract token and user data from response
      if (response.data.data?.token && response.data.data?.user) {
        const token = response.data.data.token as string;
        const userData = response.data.data.user as Record<string, unknown>;

        console.log("Signup successful with user data:", userData);

        return {
          token: token,
          user: userData,
        };
      }

      throw new Error("Invalid response format from server");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Signup error:",
        axiosError.response?.data || axiosError.message
      );

      // Handle backend error response
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }

      // Handle network errors
      if (
        axiosError.code === "NETWORK_ERROR" ||
        axiosError.code === "ERR_NETWORK"
      ) {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      }

      // Handle other errors
      throw new Error(
        axiosError.message || "An unexpected error occurred. Please try again."
      );
    }
  },

  login: async (
    credentials: LoginRequest
  ): Promise<{ token: string; user: Record<string, unknown> }> => {
    try {
      const response = await axios.post<SuccessResponse>(
        `${API_URL}/login`,
        credentials
      );
      console.log("Login response:", response.data);

      // Extract token and user data from response
      if (response.data.data?.token && response.data.data?.user) {
        const token = response.data.data.token as string;
        const userData = response.data.data.user as Record<string, unknown>;

        console.log("Login successful with user data:", userData);

        return {
          token: token,
          user: userData,
        };
      }

      throw new Error("Invalid response format from server");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Login error:",
        axiosError.response?.data || axiosError.message
      );

      // Handle backend error response
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }

      // Handle network errors
      if (
        axiosError.code === "NETWORK_ERROR" ||
        axiosError.code === "ERR_NETWORK"
      ) {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      }

      // Handle other errors
      throw new Error(
        axiosError.message || "An unexpected error occurred. Please try again."
      );
    }
  },

  getProfile: async (token: string): Promise<Record<string, unknown>> => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("Using decoded token as profile:", decoded);

      return {
        id: decoded.user_id || decoded.sub || 0,
        email: decoded.email || "user@example.com",
        name: decoded.name || "User",
      };
    } catch (error) {
      console.error("Failed to decode token:", error);
      throw new Error("Failed to get user profile");
    }
  },
};

export default authAPI;
