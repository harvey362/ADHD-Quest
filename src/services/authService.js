/**
 * Authentication Service
 *
 * Handles user authentication, registration, session management,
 * and profile operations using Supabase Auth.
 */

import { supabase, TABLES } from '../config/supabase';
import { jwtDecode } from 'jwt-decode';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.sessionCheckInterval = null;
  }

  /**
   * Initialize auth service and restore session
   */
  async initialize() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        this.currentUser = session.user;
        this.startSessionCheck();
        return session.user;
      }
      return null;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      return null;
    }
  }

  /**
   * Sign up a new user
   */
  async signUp({ email, password, username }) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from(TABLES.USER_PROFILES)
          .insert({
            user_id: authData.user.id,
            username,
            email,
            total_xp: 0,
            level: 1,
            current_level_xp: 0,
            xp_to_next_level: 200,
            tasks_completed: 0,
            subtasks_completed: 0,
            created_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        this.currentUser = authData.user;
        this.startSessionCheck();
      }

      return { user: authData.user, session: authData.session, error: null };
    } catch (error) {
      return { user: null, session: null, error };
    }
  }

  /**
   * Sign in existing user
   */
  async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      this.currentUser = data.user;
      this.startSessionCheck();

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      return { user: null, session: null, error };
    }
  }

  /**
   * Sign in with magic link (passwordless)
   */
  async signInWithMagicLink(email) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.stopSessionCheck();

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return { profile: data, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { profile: data, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(metadata) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Refresh session
   */
  async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (session) {
        this.currentUser = session.user;
      }

      return session;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return null;
    }
  }

  /**
   * Start periodic session checking
   */
  startSessionCheck() {
    // Check session every 5 minutes
    this.sessionCheckInterval = setInterval(() => {
      this.refreshSession();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop periodic session checking
   */
  stopSessionCheck() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        this.currentUser = session?.user || null;
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
      }

      callback(event, session);
    });
  }

  /**
   * Decode JWT token
   */
  decodeToken(token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  /**
   * Check if email is verified
   */
  isEmailVerified() {
    return this.currentUser?.email_confirmed_at !== null;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail() {
    try {
      if (!this.currentUser?.email) {
        throw new Error('No user email found');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: this.currentUser.email,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId) {
    try {
      // Note: This requires admin privileges or RLS policies
      // You may need to implement this as an admin function
      const { error } = await supabase.rpc('delete_user_account', {
        user_id: userId,
      });

      if (error) throw error;

      await this.signOut();

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
