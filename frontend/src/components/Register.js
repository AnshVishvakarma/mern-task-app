import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './style/Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const { login } = useContext(AuthContext);

  // Password Strength Checker
  const checkPasswordStrength = (pass) => {
    if (pass.length === 0) {
      setPasswordStrength('');
      return;
    }
    
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/)) strength++;
    if (pass.match(/[A-Z]/)) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^a-zA-Z0-9]/)) strength++;
    
    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 3) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (!termsAccepted) {
      alert('Please accept the Terms & Conditions');
      return;
    }

    setLoading(true);
    
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', { 
        name, 
        email, 
        password 
      });
      
      login(data);
      alert('🎉 Registration successful! Welcome aboard!');
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTermsAccepted(false);
      
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      alert(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className="progress-step completed">
            <span className="step-label">Account</span>
          </div>
          <div className="progress-step active">
            <span className="step-label">Details</span>
          </div>
          <div className="progress-step">
            <span className="step-label">Complete</span>
          </div>
        </div>

        {/* Logo Section */}
        <div className="register-logo">
          <div className="logo-icon">
            ✨
          </div>
          <h2>Create Account</h2>
          <p>Join us and start managing your tasks</p>
        </div>

        {/* Register Form */}
        <form className="register-form" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              required
              disabled={loading}
            />
            <span className={`input-icon ${nameFocused || name ? 'active' : ''}`}>
              👤
            </span>
          </div>

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
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
              disabled={loading}
              minLength={6}
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
            
            {/* Password Strength */}
            {password && (
              <>
                <div className="password-strength">
                  <div className={`strength-bar ${passwordStrength}`}></div>
                </div>
                <div className={`strength-text ${passwordStrength}`}>
                  {passwordStrength === 'weak' && '🔴 Weak password'}
                  {passwordStrength === 'medium' && '🟡 Medium password'}
                  {passwordStrength === 'strong' && '🟢 Strong password'}
                </div>
              </>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <span className="input-icon">
              ✓
            </span>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {/* Terms & Conditions */}
          <div className="terms-check">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="terms">
              I agree to the <a href="#" onClick={(e) => {
                e.preventDefault();
                alert('📜 Terms & Conditions:\n\n1. Be respectful\n2. Use responsibly\n3. Enjoy!');
              }}>Terms & Conditions</a> and <a href="#" onClick={(e) => {
                e.preventDefault();
                alert('🔐 Privacy Policy:\n\nYour data is safe with us!');
              }}>Privacy Policy</a>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`register-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating account...
              </>
            ) : (
              <>
                🚀 Create Account
              </>
            )}
          </button>

          {/* Divider */}

          {/* Social Buttons */}
         

          {/* Login Link */}
          <div className="login-link">
            Already have an account? <a href="/login" onClick={(e) => {
              e.preventDefault();
              window.location.href = '/login';
            }}>Sign in</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;