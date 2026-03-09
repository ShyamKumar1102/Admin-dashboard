import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Demo credentials - In production, use environment variables or backend authentication
  const demoCredentials = {
    username: process.env.REACT_APP_DEMO_USERNAME || 'admin@iotdashboard.com',
    password: process.env.REACT_APP_DEMO_PASSWORD || 'IoTAdmin2024!'
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (credentials.username === demoCredentials.username && 
          credentials.password === demoCredentials.password) {
        onLogin(true);
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 1000);
  };

  const fillDemoCredentials = () => {
    setCredentials(demoCredentials);
    setError('');
  };

  if (showSignUp) {
    const SignUp = require('./SignUp').default;
    return <SignUp onBackToLogin={() => setShowSignUp(false)} />;
  }

  if (showForgotPassword) {
    const ForgotPassword = require('./ForgotPassword').default;
    return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
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
              <i className="fas fa-microchip"></i>
            </div>
            <h1>Seniot</h1>
            <p>IoT Management Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username / Email</label>
              <div className="input-wrapper">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Enter your username or email"
                  required
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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
                  Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>

            <div className="demo-credentials">
              <p>Demo Access:</p>
              <button 
                type="button" 
                className="demo-btn"
                onClick={fillDemoCredentials}
              >
                <i className="fas fa-key"></i>
                Use Demo Credentials
              </button>
            </div>
          </form>

          <div className="login-footer">
            <div className="demo-info">
              <h4>Demo Access Available</h4>
              <p>Click "Use Demo Credentials" button above to auto-fill</p>
            </div>
            <div className="login-links">
              <a href="#forgot" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }}>Forgot Password?</a>
              <span>•</span>
              <a href="#signup" onClick={(e) => { e.preventDefault(); setShowSignUp(true); }}>Sign Up</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;