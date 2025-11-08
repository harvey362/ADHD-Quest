/**
 * Authentication Service (Validated)
 *
 * Enhanced authentication service with runtime validation using Zod.
 * This is an example implementation showing how to integrate validation.
 *
 * TODO: Migrate authService.js to this TypeScript implementation
 */

import { supabase, TABLES } from '../config/supabase';
import { jwtDecode } from 'jwt-decode';
import validationService, { type SignUpData, type SignInData, type UserProfile } from './validationService';

interface AuthResponse {
  user: any | null;
  session: any | null;
  error: Error | null;
}

class AuthServiceValidated {
  private currentUser: any | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize auth service and restore session
   */
  async initialize(): Promise<any | null> {
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
   * Sign up a new user with validation
   */
  async signUp(userData: unknown): Promise<AuthResponse> {
    try {
      // STEP 1: Validate input data
      const validation = validationService.validateSignUp(userData);

      if (!validation.success) {
        throw new Error(`Invalid sign-up data: ${validation.error}`);
      }

      const { email, password, username } = validation.data as SignUpData;

      // STEP 2: Additional sanitization for username
      const usernameValidation = validationService.validateUserInput(username, 20);
      if (!usernameValidation.success) {
        throw new Error(`Invalid username: ${usernameValidation.error}`);
      }

      // STEP 3: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: usernameValidation.data,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // STEP 4: Create user profile with validated data
        const profileData = {
          user_id: authData.user.id,
          username: usernameValidation.data,
          email,
          total_xp: 0,
          level: 1,
          current_level_xp: 0,
          xp_to_next_level: 200,
          tasks_completed: 0,
          subtasks_completed: 0,
          created_at: new Date().toISOString(),
        };

        // STEP 5: Validate profile data before insertion
        const profileValidation = validationService.validateUserProfile(profileData);

        if (!profileValidation.success) {
          console.error('Profile validation failed:', profileValidation.error);
          // Rollback: Delete the auth user if profile creation would fail
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(`Invalid profile data: ${profileValidation.error}`);
        }

        // STEP 6: Insert validated profile
        const { error: profileError } = await supabase
          .from(TABLES.USER_PROFILES)
          .insert(profileValidation.data);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        this.currentUser = authData.user;
        this.startSessionCheck();
      }

      return {
        user: authData.user,
        session: authData.session,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as Error
      };
    }
  }

  /**
   * Sign in existing user with validation
   */
  async signIn(credentials: unknown): Promise<AuthResponse> {
    try {
      // STEP 1: Validate input credentials
      const validation = validationService.validateSignIn(credentials);

      if (!validation.success) {
        throw new Error(`Invalid sign-in data: ${validation.error}`);
      }

      const { email, password } = validation.data as SignInData;

      // STEP 2: Attempt sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      this.currentUser = data.user;
      this.startSessionCheck();

      return {
        user: data.user,
        session: data.session,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as Error
      };
    }
  }

  /**
   * Sign in with magic link (passwordless)
   */
  async signInWithMagicLink(emailData: unknown): Promise<{ error: Error | null }> {
    try {
      // STEP 1: Validate email
      const validation = validationService.validatePasswordReset(emailData);

      if (!validation.success) {
        throw new Error(`Invalid email: ${validation.error}`);
      }

      const { email } = validation.data;

      // STEP 2: Send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(emailData: unknown): Promise<{ error: Error | null }> {
    try {
      // STEP 1: Validate email
      const validation = validationService.validatePasswordReset(emailData);

      if (!validation.success) {
        throw new Error(`Invalid email: ${validation.error}`);
      }

      const { email } = validation.data;

      // STEP 2: Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      this.currentUser = null;
      this.stopSessionCheck();

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): any | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get user profile with validation
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      // Validate profile data from database
      const validation = validationService.validateUserProfile(data);

      if (!validation.success) {
        console.error('Profile validation failed:', validation.error);
        // Log but don't fail - data might have legacy format
        return data;
      }

      return validation.data as UserProfile;
    } catch (error) {
      console.error('Get user profile failed:', error);
      return null;
    }
  }

  /**
   * Update user profile with validation
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: Error | null }> {
    try {
      // Get current profile
      const currentProfile = await this.getUserProfile(userId);

      if (!currentProfile) {
        throw new Error('Profile not found');
      }

      // Merge updates
      const updatedProfile = {
        ...currentProfile,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Validate merged profile
      const validation = validationService.validateUserProfile(updatedProfile);

      if (!validation.success) {
        throw new Error(`Invalid profile update: ${validation.error}`);
      }

      // Update in database
      const { error } = await supabase
        .from(TABLES.USER_PROFILES)
        .update(validation.data)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(): Promise<{ error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      if (data.session) {
        this.currentUser = data.session.user;
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Start periodic session check
   */
  private startSessionCheck(): void {
    if (this.sessionCheckInterval) {
      return;
    }

    // Check session every 5 minutes
    this.sessionCheckInterval = setInterval(
      () => {
        this.checkSession();
      },
      5 * 60 * 1000
    );
  }

  /**
   * Stop periodic session check
   */
  private stopSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Check if session is still valid
   */
  private async checkSession(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Session expired
        this.currentUser = null;
        this.stopSessionCheck();

        // Optionally notify user or redirect to login
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      } else {
        // Check if token needs refresh (< 60 seconds until expiry)
        const decoded: any = jwtDecode(session.access_token);
        const expiresAt = decoded.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        if (timeUntilExpiry < 60 * 1000) {
          await this.refreshSession();
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<{ error: Error | null }> {
    try {
      // Call the database function to cascade delete all user data
      const { error } = await supabase.rpc('delete_user_account', {
        user_id_param: userId,
      });

      if (error) {
        throw error;
      }

      // Sign out
      await this.signOut();

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }
}

// Export singleton instance
const authServiceValidated = new AuthServiceValidated();
export default authServiceValidated;
