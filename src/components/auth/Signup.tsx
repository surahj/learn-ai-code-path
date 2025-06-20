// src/components/auth/Signup.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

interface FormData {
  name: string;
  email: string;
  password: string;
  daily_commitment: number;  // Added this field
  learning_goal: string;     // Added this field
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  daily_commitment?: string; // Added this field
  learning_goal?: string;    // Added this field
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    daily_commitment: 30,    // Default value
    learning_goal: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const { signup, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'daily_commitment' ? parseInt(value) || 0 : value
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.daily_commitment <= 0) {
      newErrors.daily_commitment = 'Daily commitment must be greater than 0';
    }
    if (!formData.learning_goal.trim()) {
      newErrors.learning_goal = 'Learning goal is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Ensure field names exactly match what the API expects
      const apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        daily_commitment: formData.daily_commitment,
        learning_goal: formData.learning_goal
      };
      
      console.log('Submitting form with data:', apiData);
      
      try {
        const result = await signup(apiData);
        console.log('Signup successful:', result);
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Signup error caught:', err);
        setApiError(err.message || 'Failed to create account. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Create an Account</h2>
        {apiError && <div className="error-message">{apiError}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          {/* New fields added */}
          <div className="form-group">
            <label htmlFor="learning_goal">Learning Goal</label>
            <input
              type="text"
              id="learning_goal"
              name="learning_goal"
              placeholder="e.g., Learn JavaScript, Master Python"
              value={formData.learning_goal}
              onChange={handleChange}
              className={errors.learning_goal ? 'error' : ''}
            />
            {errors.learning_goal && <span className="error-text">{errors.learning_goal}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="daily_commitment">Daily Commitment (minutes)</label>
            <input
              type="number"
              id="daily_commitment"
              name="daily_commitment"
              min="1"
              value={formData.daily_commitment}
              onChange={handleChange}
              className={errors.daily_commitment ? 'error' : ''}
            />
            {errors.daily_commitment && <span className="error-text">{errors.daily_commitment}</span>}
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-link">
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;