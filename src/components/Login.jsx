import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Login = ({ onLogin }) => {
  const usernameRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    // onLogin now returns true if success, false if failed
    const success = await onLogin(username, password);
    if (!success) {
      setError('Invalid User ID or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="brand-section">
          <img src={logo} alt="CivilWise" className="brand-logo-img" />
        </div>

        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#333', fontSize: '1.5rem' }}>Sign In</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">User ID</label>
            <input
              type="text"
              id="username"
              ref={usernameRef}
              placeholder="Enter your User ID"
              className="form-input"
              required
              autoFocus
              autoComplete="username"
              style={{ position: 'relative', zIndex: 10 }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              ref={passwordRef}
              placeholder="Enter your password"
              className="form-input"
              required
              autoComplete="current-password"
              style={{ position: 'relative', zIndex: 10 }}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block">
            Sign In
          </button>
        </form>
      </div>

      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, var(--bg-secondary) 0%, #eef2f5 100%);
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          animation: slideUp 0.5s ease-out;
        }

        .brand-section {
          text-align: center;
          margin-bottom: 20px;
        }

        .brand-logo-img {
          max-width: 320px;
          height: auto;
          margin-bottom: 10px;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
        }

        .brand-tagline {
          color: var(--text-light);
          font-size: 0.95rem;
          margin-top: 5px;
        }

        .auth-toggle {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 2px solid #eee;
        }

        .toggle-btn {
            flex: 1;
            padding: 10px;
            background: none;
            border: none;
            font-weight: bold;
            color: #888;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
        }

        .toggle-btn.active {
            color: var(--primary-color);
            border-bottom: 2px solid var(--primary-color);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--text-color);
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.1);
        }

        .btn-block {
            width: 100%;
            padding: 14px;
            font-size: 1rem;
            margin-top: 10px;
        }

        .error-message {
          color: #dc2626;
          background-color: #fef2f2;
          padding: 10px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          font-size: 0.9rem;
          text-align: center;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
