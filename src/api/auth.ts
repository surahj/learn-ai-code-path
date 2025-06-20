// src/api/auth.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'https://ai-mentor-backend-w5gs.onrender.com';

interface DecodedToken {
  exp: number;
  user_id?: number;
  email?: string;
  name?: string;
  [key: string]: any;
}

const authAPI = {
  signup: async (userData: any): Promise<any> => {
    console.log('Sending signup request with data:', userData);
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      console.log('Signup successful response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Signup error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      if (error.response?.data?.error_message) {
        throw new Error(error.response.data.error_message);
      }
      throw error.response?.data || { message: error.message || 'Network error occurred' };
    }
  },
  
  login: async (credentials: any): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      console.log('Login response:', response.data);
      
      // Extract user info from token
      if (response.data.token) {
        const decoded = jwtDecode<DecodedToken>(response.data.token);
        console.log('Decoded token:', decoded);
        
        // Return with user data extracted from token
        return {
          token: response.data.token,
          user: {
            id: decoded.user_id || decoded.sub || 0,
            email: decoded.email || credentials.email,
            name: decoded.name || 'User',
            // Add any other fields from the token
          }
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },
  
  // Keep this but it will likely not be used
  getProfile: async (token: string): Promise<any> => {
    // Just decode the token and use that as profile
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Using decoded token as profile:', decoded);
      
      return {
        id: decoded.user_id || decoded.sub || 0, 
        email: decoded.email || 'user@example.com',
        name: decoded.name || 'User'
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      throw new Error('Failed to get user profile');
    }
  }
};

export default authAPI;

// In both handleSubmit functions:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (validateForm()) {
    setIsSubmitting(true);
    console.log('Submitting form with data:', formData);
    try {
      // For Login:
      const result = await login(formData);
      console.log('Login successful:', result);
      navigate('/dashboard');
      
      // OR for Signup:
      // const result = await signup(formData);
      // console.log('Signup successful:', result);
      // navigate('/dashboard');
    } catch (err: any) {
      console.error('Authentication error:', err);
      // Show error to user
    } finally {
      setIsSubmitting(false);
    }
  }
};