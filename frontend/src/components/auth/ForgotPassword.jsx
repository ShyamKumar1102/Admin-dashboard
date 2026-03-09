import React, { useState } from 'react';
import './Login.css';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="login-overlay"></div>
        </div>
        
        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <i className="fas fa-check-circle"></i>
              </div>
              <h1>Check Your Email</h1>
              <p>Password reset link sent</p>
            </div>

            <div className="login-form">
              <div className="demo-info" style={{ borderLeft: '4px solid #27ae60' }}>
                <h4>Email Sent Successfully!</h4>
                <p>We've sent a password reset link to <strong>{email}</strong></p>
                <p>Please check your inbox and follow the instructions.</p>
              </div>

              <button 
                type="button" 
                className="login-btn"
                onClick={onBackToLogin}
              >
                <i className="fas fa-arrow-left"></i>
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <i className="fas fa-key"></i>
            </div>
            <h1>Forgot Password?</h1>
            <p>Reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="demo-info">
              <h4>Password Reset</h4>
              <p>Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Send Reset Link
                </>
              )}
            </button>

            <div className="login-links">
              <a href="#login" onClick={(e) => { e.preventDefault(); onBackToLogin(); }}>
                <i className="fas fa-arrow-left"></i> Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
