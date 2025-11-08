/**
 * SignUp Component
 *
 * User registration interface with email/password signup
 * and username selection.
 */

import React, { useState } from 'react';
import authService from '../services/authService';
import '../styles/auth.css';

function SignUp({ onSignUp, onSwitchToLogin, onClose }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { user, error: signUpError } = await authService.signUp({
        email,
        password,
        username,
      });

      if (signUpError) throw signUpError;

      if (user) {
        onSignUp(user);
      }
    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('This email is already registered. Try logging in instead.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <button className="auth-close" onClick={onClose}>×</button>

        <h2 className="auth-title">🎮 CREATE ACCOUNT</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              ⚠️ {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="username">USERNAME</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Player1"
              className="auth-input"
              disabled={loading}
              required
              minLength={3}
              maxLength={20}
            />
            <div className="auth-hint">
              3-20 characters, letters/numbers/_
            </div>
          </div>

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
              minLength={8}
            />
            <div className="auth-hint">
              At least 8 characters
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-input"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button auth-button-primary"
            disabled={loading}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button
            className="auth-button-link"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Sign In
          </button>
        </div>

        <div className="auth-notice">
          <p>By creating an account, you agree to sync your data to the cloud.</p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
