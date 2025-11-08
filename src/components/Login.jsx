/**
 * Login Component
 *
 * User authentication interface with email/password login
 * and magic link (passwordless) option.
 */

import React, { useState } from 'react';
import authService from '../services/authService';
import '../styles/auth.css';

function Login({ onLogin, onSwitchToSignUp, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (useMagicLink) {
        const { success, error } = await authService.signInWithMagicLink(email);

        if (error) throw error;

        setMagicLinkSent(true);
      } else {
        if (!email || !password) {
          throw new Error('Please enter email and password');
        }

        const { user, error: signInError } = await authService.signIn({ email, password });

        if (signInError) throw signInError;

        if (user) {
          onLogin(user);
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setLoading(true);
    try {
      const { success, error } = await authService.resetPassword(email);

      if (error) throw error;

      alert('Password reset link sent! Check your email.');
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2 className="auth-title">✉️ Check Your Email</h2>
          <div className="auth-message">
            <p>We've sent a magic link to:</p>
            <p className="email-display">{email}</p>
            <p>Click the link in the email to sign in.</p>
          </div>
          <button
            className="auth-button"
            onClick={() => {
              setMagicLinkSent(false);
              setUseMagicLink(false);
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <button className="auth-close" onClick={onClose}>×</button>

        <h2 className="auth-title">🎮 SIGN IN</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              ⚠️ {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">EMAIL</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="auth-input"
              disabled={loading}
              required
            />
          </div>

          {!useMagicLink && (
            <div className="auth-field">
              <label htmlFor="password">PASSWORD</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
                disabled={loading}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="auth-button auth-button-primary"
            disabled={loading}
          >
            {loading ? 'SIGNING IN...' : useMagicLink ? 'SEND MAGIC LINK' : 'SIGN IN'}
          </button>

          {!useMagicLink && (
            <button
              type="button"
              className="auth-button-link"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Forgot Password?
            </button>
          )}

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="auth-button"
            onClick={() => setUseMagicLink(!useMagicLink)}
            disabled={loading}
          >
            {useMagicLink ? '← USE PASSWORD' : '✨ USE MAGIC LINK'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <button
            className="auth-button-link"
            onClick={onSwitchToSignUp}
            disabled={loading}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
