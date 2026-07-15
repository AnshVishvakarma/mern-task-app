import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './style/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login } = useContext(AuthContext);

  console.log('🔐 Login component rendered');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Login form submitted');
    
    // Basic validation
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📡 Sending login request...');
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { 
        email, 
        password 
      });
      
      console.log('✅ Login response:', data);
      
      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
      
      // ✅ login function call karein
      login(data);
      
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo Section */}
        <div className="login-logo">
          <div className="logo-icon">
            📋
          </div>
          <h2>Task Manager</h2>
          <p>Welcome back! Please login to continue</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              required
              disabled={loading}
            />
            <span className={`input-icon ${emailFocused || email ? 'active' : ''}`}>
              ✉️
            </span>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
              disabled={loading}
            />
            <span className={`input-icon ${passwordFocused || password ? 'active' : ''}`}>
              🔒
            </span>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {/* Options */}
          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Remember me
            </label>
            <a href="#" className="forgot-link" onClick={(e) => {
              e.preventDefault();
              alert('Please contact support to reset your password');
            }}>
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`login-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              <>
                🚀 Login
              </>
            )}
          </button>

          {/* Divider */}
          <div className="login-divider">or continue with</div>

          {/* Social Buttons */}
          <div className="social-buttons">
            <button type="button" className="social-btn google" disabled={loading}>
              🅶 Google
            </button>
            <button type="button" className="social-btn github" disabled={loading}>
              🐙 GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="signup-link">
            Don't have an account? <a href="#" onClick={(e) => {
              e.preventDefault();
              alert('Sign up functionality coming soon!');
            }}>Sign up</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;