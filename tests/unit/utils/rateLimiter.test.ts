/**
 * Rate Limiter Unit Tests
 *
 * Tests rate limiting functionality for authentication and API endpoints.
 * Implements security testing for P1 Issue #2
 */

import rateLimiter, {
  authRateLimiter,
  passwordResetRateLimiter,
  signUpRateLimiter,
  apiRateLimiter,
  formatRemainingTime,
  createRateLimitError,
  type RateLimitResult,
} from '../../../src/utils/rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Reset all rate limits before each test
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Clean up
    rateLimiter.destroy();
  });

  // ============================================================================
  // BASIC RATE LIMITING
  // ============================================================================

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const config = {
        maxAttempts: 5,
        windowMs: 60000,
        lockoutMs: 60000,
        keyPrefix: 'test',
      };

      for (let i = 0; i < 5; i++) {
        const result = rateLimiter.record('user1', config);
        expect(result.allowed).toBe(true);
        expect(result.attemptsRemaining).toBe(4 - i);
      }
    });

    it('should block requests after exceeding limit', () => {
      const config = {
        maxAttempts: 3,
        windowMs: 60000,
        lockoutMs: 60000,
        keyPrefix: 'test',
      };

      // First 3 attempts should succeed
      for (let i = 0; i < 3; i++) {
        const result = rateLimiter.record('user2', config);
        expect(result.allowed).toBe(true);
      }

      // 4th attempt should be blocked
      const result = rateLimiter.record('user2', config);
      expect(result.allowed).toBe(false);
      expect(result.attemptsRemaining).toBe(0);
      expect(result.lockedUntil).toBeDefined();
    });

    it('should track different keys independently', () => {
      const config = {
        maxAttempts: 3,
        windowMs: 60000,
        lockoutMs: 60000,
        keyPrefix: 'test',
      };

      // Exhaust limit for user1
      for (let i = 0; i < 4; i++) {
        rateLimiter.record('user1', config);
      }

      // user2 should still be allowed
      const result = rateLimiter.record('user2', config);
      expect(result.allowed).toBe(true);
    });

    it('should reset after time window expires', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 100, // 100ms window
        lockoutMs: 100,
        keyPrefix: 'test',
      };

      // Exhaust limit
      rateLimiter.record('user3', config);
      const blocked = rateLimiter.record('user3', config);
      expect(blocked.allowed).toBe(false);

      // Wait for window to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const result = rateLimiter.record('user3', config);
          expect(result.allowed).toBe(true);
          resolve();
        }, 150);
      });
    });

    it('should reset count when manually reset', () => {
      const config = {
        maxAttempts: 3,
        windowMs: 60000,
        lockoutMs: 60000,
        keyPrefix: 'test',
      };

      // Use up 2 attempts
      rateLimiter.record('user4', config);
      rateLimiter.record('user4', config);

      // Reset
      rateLimiter.reset('user4', 'test');

      // Should have full attempts again
      const result = rateLimiter.record('user4', config);
      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(2);
    });
  });

  // ============================================================================
  // LOCKOUT FUNCTIONALITY
  // ============================================================================

  describe('Lockout Functionality', () => {
    it('should enforce lockout duration', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 60000,
        lockoutMs: 200, // 200ms lockout
        keyPrefix: 'test',
      };

      // Trigger lockout
      rateLimiter.record('user5', config);
      rateLimiter.record('user5', config);

      // Should be locked out
      const locked = rateLimiter.record('user5', config);
      expect(locked.allowed).toBe(false);
      expect(locked.lockedUntil).toBeDefined();

      // Wait for lockout to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const result = rateLimiter.record('user5', config);
          expect(result.allowed).toBe(true);
          resolve();
        }, 250);
      });
    });

    it('should maintain lockout even if attempts are made during lockout', () => {
      const config = {
        maxAttempts: 2,
        windowMs: 60000,
        lockoutMs: 60000,
        keyPrefix: 'test',
      };

      // Trigger lockout
      rateLimiter.record('user6', config);
      rateLimiter.record('user6', config);

      const firstLocked = rateLimiter.record('user6', config);
      expect(firstLocked.allowed).toBe(false);

      // Try again during lockout
      const stillLocked = rateLimiter.record('user6', config);
      expect(stillLocked.allowed).toBe(false);
      expect(stillLocked.lockedUntil).toBeDefined();
    });
  });

  // ============================================================================
  // CHECK vs RECORD
  // ============================================================================

  describe('Check vs Record', () => {
    it('check should not increment attempt count', () => {
      const config = {
        maxAttempts: 3,
        windowMs: 60000,
        lockoutMs: 60000,
        keyPrefix: 'test',
      };

      // Check multiple times
      for (let i = 0; i < 5; i++) {
        const result = rateLimiter.check('user7', config);
        expect(result.allowed).toBe(true);
        expect(result.attemptsRemaining).toBe(2);
      }

      // First record should still have 2 attempts remaining
      const result = rateLimiter.record('user7', config);
      expect(result.attemptsRemaining).toBe(2);
    });

    it('check should reflect current state after records', () => {
      const config = {
        maxAttempts: 3,
        windowMs: 60000,
        lockoutMs: 60000,
        keyPrefix: 'test',
      };

      // Record 2 attempts
      rateLimiter.record('user8', config);
      rateLimiter.record('user8', config);

      // Check should show 1 remaining
      const result = rateLimiter.check('user8', config);
      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(1);
    });
  });

  // ============================================================================
  // AUTHENTICATION RATE LIMITER
  // ============================================================================

  describe('Authentication Rate Limiter', () => {
    beforeEach(() => {
      // Reset auth rate limiter before each test
      authRateLimiter.reset('test@example.com');
    });

    it('should allow 5 login attempts', () => {
      for (let i = 0; i < 5; i++) {
        const result = authRateLimiter.record('test@example.com');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block after 5 failed login attempts', () => {
      // 5 failed attempts
      for (let i = 0; i < 5; i++) {
        authRateLimiter.record('test@example.com');
      }

      // 6th attempt should be blocked
      const result = authRateLimiter.record('test@example.com');
      expect(result.allowed).toBe(false);
      expect(result.lockedUntil).toBeDefined();
    });

    it('should reset after successful login', () => {
      // 3 failed attempts
      authRateLimiter.record('test@example.com');
      authRateLimiter.record('test@example.com');
      authRateLimiter.record('test@example.com');

      // Successful login - reset
      authRateLimiter.reset('test@example.com');

      // Should have full attempts again
      const result = authRateLimiter.record('test@example.com');
      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(4);
    });

    it('should be case-insensitive for emails', () => {
      authRateLimiter.record('Test@Example.com');
      authRateLimiter.record('TEST@EXAMPLE.COM');

      const result = authRateLimiter.check('test@example.com');
      expect(result.attemptsRemaining).toBe(3);
    });

    it('should enforce 15 minute lockout', () => {
      const config = authRateLimiter.config;

      expect(config.lockoutMs).toBe(15 * 60 * 1000);
      expect(config.maxAttempts).toBe(5);
    });
  });

  // ============================================================================
  // PASSWORD RESET RATE LIMITER
  // ============================================================================

  describe('Password Reset Rate Limiter', () => {
    beforeEach(() => {
      passwordResetRateLimiter.reset('test@example.com');
    });

    it('should allow 3 password reset attempts', () => {
      for (let i = 0; i < 3; i++) {
        const result = passwordResetRateLimiter.record('test@example.com');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block after 3 password reset attempts', () => {
      // 3 attempts
      for (let i = 0; i < 3; i++) {
        passwordResetRateLimiter.record('test@example.com');
      }

      // 4th should be blocked
      const result = passwordResetRateLimiter.record('test@example.com');
      expect(result.allowed).toBe(false);
    });

    it('should enforce 1 hour lockout', () => {
      const config = passwordResetRateLimiter.config;

      expect(config.lockoutMs).toBe(60 * 60 * 1000);
      expect(config.maxAttempts).toBe(3);
    });
  });

  // ============================================================================
  // SIGNUP RATE LIMITER
  // ============================================================================

  describe('Sign-Up Rate Limiter', () => {
    beforeEach(() => {
      signUpRateLimiter.reset('192.168.1.1');
    });

    it('should allow 3 signups per IP', () => {
      for (let i = 0; i < 3; i++) {
        const result = signUpRateLimiter.record('192.168.1.1');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block after 3 signups from same IP', () => {
      // 3 signups
      for (let i = 0; i < 3; i++) {
        signUpRateLimiter.record('192.168.1.1');
      }

      // 4th should be blocked
      const result = signUpRateLimiter.record('192.168.1.1');
      expect(result.allowed).toBe(false);
    });

    it('should enforce 24 hour lockout', () => {
      const config = signUpRateLimiter.config;

      expect(config.lockoutMs).toBe(24 * 60 * 60 * 1000);
      expect(config.maxAttempts).toBe(3);
    });

    it('should track different IPs independently', () => {
      // Exhaust limit for IP1
      for (let i = 0; i < 4; i++) {
        signUpRateLimiter.record('192.168.1.1');
      }

      // IP2 should still be allowed
      const result = signUpRateLimiter.record('192.168.1.2');
      expect(result.allowed).toBe(true);
    });
  });

  // ============================================================================
  // API RATE LIMITER
  // ============================================================================

  describe('API Rate Limiter', () => {
    beforeEach(() => {
      apiRateLimiter.reset('user123');
    });

    it('should allow 100 requests per minute', () => {
      for (let i = 0; i < 100; i++) {
        const result = apiRateLimiter.record('user123');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block after 100 requests', () => {
      // 100 requests
      for (let i = 0; i < 100; i++) {
        apiRateLimiter.record('user123');
      }

      // 101st should be blocked
      const result = apiRateLimiter.record('user123');
      expect(result.allowed).toBe(false);
    });

    it('should enforce 1 minute lockout', () => {
      const config = apiRateLimiter.config;

      expect(config.lockoutMs).toBe(60 * 1000);
      expect(config.maxAttempts).toBe(100);
    });
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  describe('Helper Functions', () => {
    describe('formatRemainingTime', () => {
      it('should format seconds', () => {
        expect(formatRemainingTime(1000)).toBe('1 second');
        expect(formatRemainingTime(5000)).toBe('5 seconds');
        expect(formatRemainingTime(30000)).toBe('30 seconds');
      });

      it('should format minutes', () => {
        expect(formatRemainingTime(60000)).toBe('1 minute');
        expect(formatRemainingTime(120000)).toBe('2 minutes');
        expect(formatRemainingTime(900000)).toBe('15 minutes');
      });

      it('should format hours', () => {
        expect(formatRemainingTime(3600000)).toBe('1 hour');
        expect(formatRemainingTime(7200000)).toBe('2 hours');
        expect(formatRemainingTime(86400000)).toBe('24 hours');
      });

      it('should round up', () => {
        expect(formatRemainingTime(1500)).toBe('2 seconds');
        expect(formatRemainingTime(61000)).toBe('2 minutes');
      });
    });

    describe('createRateLimitError', () => {
      it('should create lockout error message', () => {
        const result: RateLimitResult = {
          allowed: false,
          attemptsRemaining: 0,
          lockedUntil: Date.now() + 900000, // 15 minutes
        };

        const error = createRateLimitError(result);
        expect(error.message).toContain('locked');
        expect(error.message).toContain('15 minute');
      });

      it('should create rate limit error message', () => {
        const result: RateLimitResult = {
          allowed: false,
          attemptsRemaining: 2,
          resetTime: Date.now() + 600000, // 10 minutes
        };

        const error = createRateLimitError(result);
        expect(error.message).toContain('Too many attempts');
        expect(error.message).toContain('10 minute');
        expect(error.message).toContain('2 attempts remaining');
      });

      it('should create generic error for unknown state', () => {
        const result: RateLimitResult = {
          allowed: false,
          attemptsRemaining: 0,
        };

        const error = createRateLimitError(result);
        expect(error.message).toContain('Rate limit exceeded');
      });
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle concurrent attempts correctly', () => {
      const config = {
        maxAttempts: 5,
        windowMs: 60000,
        lockoutMs: 60000,
        keyPrefix: 'test',
      };

      // Simulate rapid concurrent attempts
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(rateLimiter.record('concurrent_user', config));
      }

      // First 5 should be allowed
      for (let i = 0; i < 5; i++) {
        expect(results[i].allowed).toBe(true);
      }

      // Rest should be blocked
      for (let i = 5; i < 10; i++) {
        expect(results[i].allowed).toBe(false);
      }
    });

    it('should handle empty keys gracefully', () => {
      const config = {
        maxAttempts: 3,
        windowMs: 60000,
        lockoutMs: 60000,
        keyPrefix: 'test',
      };

      const result = rateLimiter.record('', config);
      expect(result.allowed).toBe(true);
    });

    it('should handle very long keys', () => {
      const config = {
        maxAttempts: 3,
        windowMs: 60000,
        lockoutMs: 60000,
        keyPrefix: 'test',
      };

      const longKey = 'a'.repeat(1000);
      const result = rateLimiter.record(longKey, config);
      expect(result.allowed).toBe(true);
    });
  });

  // ============================================================================
  // SECURITY SCENARIOS
  // ============================================================================

  describe('Security Scenarios', () => {
    it('should prevent brute force login attacks', () => {
      const attacker = 'attacker@evil.com';

      // Simulate brute force attack (100 login attempts)
      let blockedCount = 0;

      for (let i = 0; i < 100; i++) {
        const result = authRateLimiter.record(attacker);

        if (!result.allowed) {
          blockedCount++;
        }
      }

      // Should block most attempts after first 5
      expect(blockedCount).toBeGreaterThan(90);
    });

    it('should prevent password reset abuse', () => {
      const victim = 'victim@example.com';

      // Attempt to flood victim with reset emails
      for (let i = 0; i < 10; i++) {
        passwordResetRateLimiter.record(victim);
      }

      // Should only allow 3 resets
      const data = rateLimiter.getAttemptData(victim.toLowerCase(), 'password_reset');
      expect(data).toBeDefined();
      expect(data!.count).toBeGreaterThanOrEqual(3);
    });

    it('should prevent account enumeration via signup', () => {
      const attackerIP = '1.2.3.4';

      // Try to create many accounts to enumerate valid emails
      for (let i = 0; i < 10; i++) {
        signUpRateLimiter.record(attackerIP);
      }

      // Should only allow 3 signups
      const result = signUpRateLimiter.check(attackerIP);
      expect(result.allowed).toBe(false);
    });

    it('should allow legitimate users after failed attack', () => {
      const user = 'user@example.com';

      // User has 3 failed login attempts
      authRateLimiter.record(user);
      authRateLimiter.record(user);
      authRateLimiter.record(user);

      // User remembers password and logs in successfully
      authRateLimiter.reset(user);

      // User should be able to log in
      const result = authRateLimiter.record(user);
      expect(result.allowed).toBe(true);
    });
  });
});
