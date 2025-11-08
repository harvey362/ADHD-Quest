/**
 * User Profile Component
 *
 * Displays and manages user profile information,
 * including avatar, username, stats, and account settings.
 */

import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import cloudSyncService from '../services/cloudSyncService';
import { getRankForLevel } from '../utils/rankSystem';
import '../styles/userprofile.css';

function UserProfile({ user, profile, onUpdate, onSignOut }) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata?.username || '');
    }
  }, [user]);

  useEffect(() => {
    // Get sync status
    const status = cloudSyncService.getSyncStatus();
    setSyncStatus(status);

    // Update sync status periodically
    const interval = setInterval(() => {
      const status = cloudSyncService.getSyncStatus();
      setSyncStatus(status);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!username || username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }

      const { user: updatedUser, error } = await authService.updateUserMetadata({
        username,
      });

      if (error) throw error;

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      if (onUpdate) {
        onUpdate(updatedUser);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setLoading(true);
    try {
      await cloudSyncService.forceSyncNow();
      setSuccess('Sync completed successfully!');

      // Update sync status
      const status = cloudSyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      setError('Sync failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rank = getRankForLevel(profile?.level || 1);

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {rank?.icon || '👤'}
        </div>
        <div className="profile-info">
          <div className="profile-username">
            {user?.user_metadata?.username || 'Player'}
          </div>
          <div className="profile-rank">
            {rank?.name || 'NOVICE'}
          </div>
          <div className="profile-level">
            Level {profile?.level || 1}
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <div className="stat-value">{profile?.totalXP?.toLocaleString() || 0}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{profile?.tasksCompleted || 0}</div>
          <div className="stat-label">Tasks Done</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{profile?.subtasksCompleted || 0}</div>
          <div className="stat-label">Subtasks</div>
        </div>
      </div>

      {error && (
        <div className="profile-error">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="profile-success">
          ✅ {success}
        </div>
      )}

      <div className="profile-section">
        <h3>Account Settings</h3>

        {isEditing ? (
          <div className="profile-edit">
            <div className="auth-field">
              <label htmlFor="username">USERNAME</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input"
                disabled={loading}
              />
            </div>
            <div className="profile-actions">
              <button
                className="auth-button auth-button-primary"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? 'SAVING...' : 'SAVE'}
              </button>
              <button
                className="auth-button"
                onClick={() => {
                  setIsEditing(false);
                  setUsername(user?.user_metadata?.username || '');
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-info-row">
            <div>
              <div className="info-label">Email</div>
              <div className="info-value">{user?.email}</div>
            </div>
            <button
              className="auth-button"
              onClick={() => setIsEditing(true)}
            >
              EDIT PROFILE
            </button>
          </div>
        )}
      </div>

      <div className="profile-section">
        <h3>Cloud Sync</h3>

        {syncStatus && (
          <div className="sync-status">
            <div className="sync-info">
              <div className="info-label">Status</div>
              <div className={`info-value ${syncStatus.offlineMode ? 'offline' : 'online'}`}>
                {syncStatus.offlineMode ? '🔴 OFFLINE' : '🟢 ONLINE'}
              </div>
            </div>

            {syncStatus.lastSync && (
              <div className="sync-info">
                <div className="info-label">Last Sync</div>
                <div className="info-value">
                  {new Date(syncStatus.lastSync).toLocaleString()}
                </div>
              </div>
            )}

            {syncStatus.pendingChanges > 0 && (
              <div className="sync-info">
                <div className="info-label">Pending Changes</div>
                <div className="info-value warning">
                  {syncStatus.pendingChanges}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          className="auth-button"
          onClick={handleSyncNow}
          disabled={loading || syncStatus?.inProgress}
        >
          {syncStatus?.inProgress ? 'SYNCING...' : 'SYNC NOW'}
        </button>
      </div>

      <div className="profile-section">
        <h3>Account Actions</h3>

        <div className="profile-actions">
          <button
            className="auth-button auth-button-danger"
            onClick={onSignOut}
          >
            SIGN OUT
          </button>
        </div>
      </div>

      <div className="profile-footer">
        <p>ADHD Quest v1.0.0</p>
        <p>Account created: {new Date(user?.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export default UserProfile;
