/**
 * Rate Limiter Utility
 *
 * Implements rate limiting to prevent brute force attacks on authentication
 * and other sensitive endpoints.
 *
 * Implements P1 security requirement from SECURITY_AUDIT.md Issue #2
 */

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  /**
   * Maximum number of attempts allowed within the time window
   */
  maxAttempts: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Lockout duration in milliseconds after exceeding max attempts
   */
  lockoutMs: number;

  /**
   * Key prefix for storage
   */
  keyPrefix: string;
}

/**
 * Attempt tracking data
 */
interface AttemptData {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  attemptsRemaining: number;
  resetTime?: number;
  lockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, AttemptData> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired attempts every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if an action is allowed under rate limit
   */
  check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const fullKey = `${config.keyPrefix}:${key}`;
    const data = this.attempts.get(fullKey);

    // Check if currently locked out
    if (data?.lockedUntil && data.lockedUntil > now) {
      return {
        allowed: false,
        attemptsRemaining: 0,
        lockedUntil: data.lockedUntil,
      };
    }

    // If no attempts or window expired, reset
    if (!data || now - data.firstAttempt > config.windowMs) {
      this.attempts.set(fullKey, {
        count: 0,
        firstAttempt: now,
      });

      return {
        allowed: true,
        attemptsRemaining: config.maxAttempts - 1,
        resetTime: now + config.windowMs,
      };
    }

    // Check if within limit
    if (data.count < config.maxAttempts) {
      return {
        allowed: true,
        attemptsRemaining: config.maxAttempts - data.count - 1,
        resetTime: data.firstAttempt + config.windowMs,
      };
    }

    // Exceeded limit - apply lockout
    const lockedUntil = now + config.lockoutMs;
    this.attempts.set(fullKey, {
      ...data,
      lockedUntil,
    });

    return {
      allowed: false,
      attemptsRemaining: 0,
      lockedUntil,
    };
  }

  /**
   * Record an attempt
   */
  record(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const fullKey = `${config.keyPrefix}:${key}`;
    const data = this.attempts.get(fullKey);

    // Check if currently locked out
    if (data?.lockedUntil && data.lockedUntil > now) {
      return {
        allowed: false,
        attemptsRemaining: 0,
        lockedUntil: data.lockedUntil,
      };
    }

    // If no attempts or window expired, start new window
    if (!data || now - data.firstAttempt > config.windowMs) {
      this.attempts.set(fullKey, {
        count: 1,
        firstAttempt: now,
      });

      return {
        allowed: true,
        attemptsRemaining: config.maxAttempts - 1,
        resetTime: now + config.windowMs,
      };
    }

    // Increment attempt count
    const newCount = data.count + 1;
    this.attempts.set(fullKey, {
      ...data,
      count: newCount,
    });

    // Check if limit exceeded
    if (newCount >= config.maxAttempts) {
      const lockedUntil = now + config.lockoutMs;
      this.attempts.set(fullKey, {
        ...data,
        count: newCount,
        lockedUntil,
      });

      return {
        allowed: false,
        attemptsRemaining: 0,
        lockedUntil,
      };
    }

    return {
      allowed: true,
      attemptsRemaining: config.maxAttempts - newCount,
      resetTime: data.firstAttempt + config.windowMs,
    };
  }

  /**
   * Reset attempts for a key
   */
  reset(key: string, keyPrefix: string): void {
    const fullKey = `${keyPrefix}:${key}`;
    this.attempts.delete(fullKey);
  }

  /**
   * Clean up expired attempts
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, data] of this.attempts.entries()) {
      // Remove if lockout expired and no recent attempts
      if (data.lockedUntil && data.lockedUntil < now - 60 * 60 * 1000) {
        this.attempts.delete(key);
      }
      // Remove if window expired and no lockout
      else if (!data.lockedUntil && now - data.firstAttempt > 24 * 60 * 60 * 1000) {
        this.attempts.delete(key);
      }
    }
  }

  /**
   * Destroy rate limiter (stop cleanup interval)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get current attempt data for a key (for testing/debugging)
   */
  getAttemptData(key: string, keyPrefix: string): AttemptData | undefined {
    const fullKey = `${keyPrefix}:${key}`;
    return this.attempts.get(fullKey);
  }
}

// Export singleton instance
const rateLimiter = new RateLimiter();
export default rateLimiter;

// ============================================================================
// PRE-CONFIGURED RATE LIMITERS FOR COMMON USE CASES
// ============================================================================

/**
 * Authentication rate limiter
 * 5 attempts per 15 minutes, 15 minute lockout
 */
export const authRateLimiter = {
  config: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 15 * 60 * 1000, // 15 minute lockout
    keyPrefix: 'auth',
  },

  /**
   * Check if authentication attempt is allowed
   * @param identifier - Email or username
   */
  check(identifier: string): RateLimitResult {
    return rateLimiter.check(identifier.toLowerCase(), this.config);
  },

  /**
   * Record an authentication attempt
   * @param identifier - Email or username
   */
  record(identifier: string): RateLimitResult {
    return rateLimiter.record(identifier.toLowerCase(), this.config);
  },

  /**
   * Reset rate limit for identifier (e.g., after successful login)
   * @param identifier - Email or username
   */
  reset(identifier: string): void {
    rateLimiter.reset(identifier.toLowerCase(), this.config.keyPrefix);
  },
};

/**
 * Password reset rate limiter
 * 3 attempts per hour, 1 hour lockout
 */
export const passwordResetRateLimiter = {
  config: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutMs: 60 * 60 * 1000, // 1 hour lockout
    keyPrefix: 'password_reset',
  },

  check(email: string): RateLimitResult {
    return rateLimiter.check(email.toLowerCase(), this.config);
  },

  record(email: string): RateLimitResult {
    return rateLimiter.record(email.toLowerCase(), this.config);
  },

  reset(email: string): void {
    rateLimiter.reset(email.toLowerCase(), this.config.keyPrefix);
  },
};

/**
 * Account creation rate limiter
 * 3 accounts per IP per day
 */
export const signUpRateLimiter = {
  config: {
    maxAttempts: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    lockoutMs: 24 * 60 * 60 * 1000, // 24 hour lockout
    keyPrefix: 'signup',
  },

  check(ip: string): RateLimitResult {
    return rateLimiter.check(ip, this.config);
  },

  record(ip: string): RateLimitResult {
    return rateLimiter.record(ip, this.config);
  },

  reset(ip: string): void {
    rateLimiter.reset(ip, this.config.keyPrefix);
  },
};

/**
 * API rate limiter (general purpose)
 * 100 requests per minute
 */
export const apiRateLimiter = {
  config: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    lockoutMs: 60 * 1000, // 1 minute lockout
    keyPrefix: 'api',
  },

  check(userId: string): RateLimitResult {
    return rateLimiter.check(userId, this.config);
  },

  record(userId: string): RateLimitResult {
    return rateLimiter.record(userId, this.config);
  },

  reset(userId: string): void {
    rateLimiter.reset(userId, this.config.keyPrefix);
  },
};

/**
 * Format remaining time as human-readable string
 */
export function formatRemainingTime(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000);

  if (totalSeconds < 60) {
    return `${totalSeconds} second${totalSeconds !== 1 ? 's' : ''}`;
  }

  const minutes = Math.ceil(totalSeconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}

/**
 * Create a user-friendly error message for rate limit
 */
export function createRateLimitError(result: RateLimitResult): Error {
  if (result.lockedUntil) {
    const remaining = result.lockedUntil - Date.now();
    const timeStr = formatRemainingTime(remaining);

    return new Error(
      `Too many failed attempts. Your account is locked. Please try again in ${timeStr}.`
    );
  }

  if (result.resetTime) {
    const remaining = result.resetTime - Date.now();
    const timeStr = formatRemainingTime(remaining);

    return new Error(
      `Too many attempts. Please try again in ${timeStr}. (${result.attemptsRemaining} attempts remaining)`
    );
  }

  return new Error('Rate limit exceeded. Please try again later.');
}
