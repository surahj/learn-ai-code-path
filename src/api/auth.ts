import axios, { AxiosError } from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://ai-mentor-backend-w5gs.onrender.com";

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

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

interface ResendOTPRequest {
  email: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

interface GoogleLoginRequest {
  token: string;
}

// Backend response interfaces
interface ErrorResponse {
  error_code: number;
  error_message: string;
}

interface SuccessResponse {
  status: number;
  message: string;
  data: Record<string, unknown> | null;
}

interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

interface UpdateProfileRequest {
  age?: number;
  level?: string;
  background?: string;
  preferred_language?: string;
  interests?: string;
  country?: string;
}

const authAPI = {
  signup: async (userData: CreateUserRequest): Promise<{ message: string }> => {
    try {
      const response = await axios.post<SuccessResponse>(
        `${API_URL}/signup`,
        userData
      );
      return {
        message: response.data.message || "OTP sent successfully",
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(
        axiosError.message || "An unexpected error occurred. Please try again."
      );
    }
  },

  verifyOtp: async (
    otpData: VerifyOTPRequest
  ): Promise<{ token: string; user: Record<string, unknown> }> => {
    try {
      const response = await axios.post<SuccessResponse>(
        `${API_URL}/verify-otp`,
        otpData
      );

      if (response.data.data?.token && response.data.data?.user) {
        const token = response.data.data.token as string;
        const userData = response.data.data.user as Record<string, unknown>;
        return {
          token: token,
          user: userData,
        };
      }

      throw new Error(
        "Invalid response format from server during OTP verification"
      );
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(
        axiosError.message ||
          "An unexpected error occurred during OTP verification."
      );
    }
  },

  resendOtp: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await axios.post<SuccessResponse>(
        `${API_URL}/resend-otp`,
        { email }
      );
      return {
        message: response.data.message || "OTP resent successfully",
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(
        axiosError.message ||
          "An unexpected error occurred while resending OTP."
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

      if (response.data.data?.token && response.data.data?.user) {
        const token = response.data.data.token as string;
        const userData = response.data.data.user as Record<string, unknown>;

        return {
          token: token,
          user: userData,
        };
      }

      throw new Error("Invalid response format from server");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(
        axiosError.message || "An unexpected error occurred. Please try again."
      );
    }
  },

  googleLogin: async (
    token: string
  ): Promise<{ token: string; user: Record<string, unknown> }> => {
    try {
      const response = await axios.post<SuccessResponse>(
        `${API_URL}/auth/google/login`,
        { token }
      );

      if (response.data.data?.token && response.data.data?.user) {
        const token = response.data.data.token as string;
        const userData = response.data.data.user as Record<string, unknown>;

        return {
          token: token,
          user: userData,
        };
      }
      throw new Error("Invalid response from server on Google login");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(
        axiosError.message ||
          "An unexpected error occurred during Google login."
      );
    }
  },

  getProfile: async (token: string): Promise<Record<string, unknown>> => {
    try {
      const response = await axios.get<SuccessResponse>(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response format from server");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response && axiosError.response.status === 401) {
        throw new Error("Token expired or invalid");
      }
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(
        axiosError.message ||
          "An unexpected error occurred while fetching profile."
      );
    }
  },

  updateProfile: async (
    token: string,
    profileData: UpdateProfileRequest
  ): Promise<Record<string, unknown>> => {
    try {
      const response = await axios.put<SuccessResponse>(
        `${API_URL}/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.data) {
        return response.data.data;
      }

      throw new Error("Invalid response format from server");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response && axiosError.response.status === 401) {
        throw new Error("Token expired or invalid");
      }
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(
        axiosError.message ||
          "An unexpected error occurred while updating profile."
      );
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await axios.post<SuccessResponse>(
        `${API_URL}/forgot-password`,
        { email }
      );
      return { message: response.data.message };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(
        axiosError.message ||
          "An unexpected error occurred while sending the password reset email."
      );
    }
  },

  resetPassword: async (resetData: {
    email: string;
    otp: string;
    password: string;
  }): Promise<{ message: string }> => {
    try {
      const response = await axios.post<SuccessResponse>(
        `${API_URL}/reset-password`,
        resetData
      );
      return { message: response.data.message };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.error_message) {
        throw new Error(axiosError.response.data.error_message);
      }
      throw new Error(
        axiosError.message ||
          "An unexpected error occurred while resetting the password."
      );
    }
  },
};

export default authAPI;
export type {
  CreateUserRequest,
  VerifyOTPRequest,
  ResendOTPRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GoogleLoginRequest,
  UserResponse,
  UpdateProfileRequest,
};
