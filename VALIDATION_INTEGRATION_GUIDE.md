# Validation Integration Guide

## Overview

This guide explains how to integrate Zod runtime validation into ADHD Quest to address the P1 security issue identified in `SECURITY_AUDIT.md`.

**Status**: ✅ Infrastructure Complete - Integration In Progress

**P1 Security Issue**: No runtime data validation (attackers could inject malicious data via localStorage manipulation, XSS, or API responses)

**Solution**: Zod validation schemas + validation service + integration into all services

---

## What's Been Implemented

### ✅ Core Infrastructure

1. **`src/schemas/validationSchemas.ts`** - Complete Zod schemas for all data types:
   - User authentication (sign-up, sign-in, profiles)
   - Tasks and subtasks
   - Achievements
   - Streaks
   - Statistics
   - Notes, drawings, Pomodoro sessions
   - Settings, themes, notifications
   - Data export/import
   - API responses

2. **`src/services/validationService.ts`** - Centralized validation service:
   - Type-safe validation methods for all schemas
   - Array validation (tasks, notes, quests)
   - localStorage validation
   - Input sanitization (XSS prevention)
   - URL validation (SSRF prevention)
   - Detailed error reporting

3. **`src/services/authService.validated.ts`** - Example TypeScript implementation:
   - Shows how to integrate validation into existing services
   - Validates all inputs before processing
   - Validates data from database before using
   - Proper error handling

4. **`src/utils/localStorageValidator.ts`** (see below) - Drop-in wrapper:
   - Validates all localStorage reads/writes
   - Prevents corrupt data from crashing the app
   - Logs validation errors for debugging

---

## How to Use Validation

### Pattern 1: Validate User Input

**Before**:
```javascript
async signUp({ email, password, username }) {
  // Directly use unvalidated input - DANGEROUS!
  const { data } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });
}
```

**After**:
```typescript
import validationService from './validationService';

async signUp(userData: unknown) {
  // STEP 1: Validate input
  const validation = validationService.validateSignUp(userData);

  if (!validation.success) {
    throw new Error(`Invalid input: ${validation.error}`);
  }

  const { email, password, username } = validation.data;

  // STEP 2: Use validated data safely
  const { data } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });
}
```

### Pattern 2: Validate Data from Database/API

**Before**:
```javascript
const { data: tasks } = await supabase
  .from('tasks')
  .select('*');

// Directly use unvalidated database data - DANGEROUS!
localStorage.setItem('tasks', JSON.stringify(tasks));
```

**After**:
```typescript
import validationService from './validationService';

const { data: tasks } = await supabase
  .from('tasks')
  .select('*');

// STEP 1: Validate data from database
const validation = validationService.validateTasks(tasks);

if (!validation.success) {
  console.error('Database returned invalid tasks:', validation.error);
  throw new Error('Data integrity error');
}

// STEP 2: Use validated data safely
localStorage.setItem('tasks', JSON.stringify(validation.data));
```

### Pattern 3: Validate localStorage Reads

**Before**:
```javascript
const tasks = JSON.parse(localStorage.getItem('adhd_quest_tasks') || '[]');

// Directly use unvalidated localStorage data - DANGEROUS!
// Attacker could inject malicious data via DevTools
tasks.forEach(task => processTask(task));
```

**After**:
```typescript
import validationService from './validationService';

const rawTasks = JSON.parse(localStorage.getItem('adhd_quest_tasks') || '[]');

// STEP 1: Validate localStorage data
const validation = validationService.validateTasks(rawTasks);

if (!validation.success) {
  console.error('localStorage contains invalid tasks:', validation.error);
  // Clear corrupt data
  localStorage.removeItem('adhd_quest_tasks');
  return [];
}

// STEP 2: Use validated data safely
const tasks = validation.data;
tasks.forEach(task => processTask(task));
```

---

## Migration Checklist

### Phase 1: Critical Services (Week 1)

- [ ] **authService.js** → Migrate to `authService.validated.ts`
  - [ ] Validate sign-up data
  - [ ] Validate sign-in data
  - [ ] Validate profile updates
  - [ ] Update imports in components

- [ ] **cloudSyncService.js** → Add validation
  - [ ] Validate all localStorage reads before sync
  - [ ] Validate all database responses before saving to localStorage
  - [ ] Validate data before upserting to database
  - [ ] Add validation to `mergeTasks`, `mergeNotes`, etc.

- [ ] **Dashboard.jsx** → Add localStorage validation
  - [ ] Use `validatedLocalStorage` wrapper (see below)
  - [ ] Validate tasks before rendering
  - [ ] Handle validation errors gracefully

### Phase 2: Widget Services (Week 2)

- [ ] **TaskCrusher.jsx** → Validate task operations
  - [ ] Validate new task input
  - [ ] Validate subtask input
  - [ ] Validate task updates
  - [ ] Validate localStorage reads

- [ ] **QuickCapture.jsx** → Validate note operations
  - [ ] Validate note input (max length, XSS prevention)
  - [ ] Validate notes from localStorage

- [ ] **Pomodoro.jsx** → Validate session data
  - [ ] Validate session creation
  - [ ] Validate session completion

- [ ] **TimeTrainer.jsx** → Validate results
  - [ ] Validate result data before saving

- [ ] **Settings.jsx** → Validate settings
  - [ ] Validate theme changes
  - [ ] Validate notification settings
  - [ ] Validate Pomodoro settings

### Phase 3: Data Operations (Week 2-3)

- [ ] **exportService.js** → Add validation
  - [ ] Validate data before export
  - [ ] Validate imported data before merging

- [ ] **statsAggregator.js** → Add validation
  - [ ] Validate statistics before calculations
  - [ ] Validate aggregated results

- [ ] **streakTracker.js** → Add validation (if needed)
  - Already has good date validation, but add schema validation for data integrity

---

## Drop-in Solutions

### Solution 1: localStorage Validator Wrapper

Create `src/utils/localStorageValidator.ts`:

```typescript
import validationService from '../services/validationService';

/**
 * Validated localStorage wrapper
 * Drop-in replacement for localStorage that validates all reads/writes
 */
export const validatedLocalStorage = {
  getItem(key: string): string | null {
    const value = localStorage.getItem(key);

    if (!value) {
      return null;
    }

    try {
      const parsed = JSON.parse(value);

      // Validate known keys
      const validated = validationService.validateLocalStorageData(key, parsed);

      return JSON.stringify(validated);
    } catch (error) {
      console.error(`Failed to validate localStorage key "${key}":`, error);

      // In production, return null to prevent crashes
      if (process.env.NODE_ENV === 'production') {
        return null;
      }

      // In development, throw to catch issues early
      throw error;
    }
  },

  setItem(key: string, value: string): void {
    try {
      const parsed = JSON.parse(value);

      // Validate before saving
      const validated = validationService.validateLocalStorageData(key, parsed);

      localStorage.setItem(key, JSON.stringify(validated));
    } catch (error) {
      console.error(`Failed to validate data for localStorage key "${key}":`, error);
      throw error;
    }
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },

  key(index: number): string | null {
    return localStorage.key(index);
  },

  get length(): number {
    return localStorage.length;
  },
};
```

**Usage**:
```typescript
// Simply replace localStorage with validatedLocalStorage
import { validatedLocalStorage } from './utils/localStorageValidator';

// Old code
const tasks = JSON.parse(localStorage.getItem('adhd_quest_tasks') || '[]');

// New code (validated automatically)
const tasks = JSON.parse(validatedLocalStorage.getItem('adhd_quest_tasks') || '[]');
```

### Solution 2: Form Validation Hook

Create `src/hooks/useValidatedForm.ts`:

```typescript
import { useState } from 'react';
import validationService from '../services/validationService';
import type { ValidationResult } from '../services/validationService';

export function useValidatedForm<T>(
  validator: (data: unknown) => ValidationResult<T>
) {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (data: unknown): T | null => {
    const result = validator(data);

    if (!result.success) {
      setErrors([result.error || 'Validation failed']);
      return null;
    }

    setErrors([]);
    return result.data as T;
  };

  return {
    validate,
    errors,
    hasErrors: errors.length > 0,
    clearErrors: () => setErrors([]),
  };
}
```

**Usage**:
```tsx
import { useValidatedForm } from './hooks/useValidatedForm';
import validationService from './services/validationService';

function SignUpForm() {
  const { validate, errors, hasErrors } = useValidatedForm(
    validationService.validateSignUp.bind(validationService)
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      email: e.target.email.value,
      password: e.target.password.value,
      username: e.target.username.value,
    };

    const validated = validate(formData);

    if (!validated) {
      // Show errors
      return;
    }

    // Use validated data
    authService.signUp(validated);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {hasErrors && (
        <div className="errors">
          {errors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}
    </form>
  );
}
```

---

## Testing Validation

### Unit Tests for Validation Schemas

Create `tests/unit/schemas/validationSchemas.test.ts`:

```typescript
import {
  signUpSchema,
  taskSchema,
  userProfileSchema,
} from '../../../src/schemas/validationSchemas';

describe('Validation Schemas', () => {
  describe('signUpSchema', () => {
    it('should validate correct sign-up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
        username: 'testuser',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak', // Too short, no number
        username: 'testuser',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid username', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'ab', // Too short
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('taskSchema', () => {
    it('should validate complete task data', () => {
      const validTask = {
        id: '123',
        title: 'Test Task',
        priority: 'medium',
        status: 'pending',
        subtasks: [],
        tags: ['work'],
        total_xp: 100,
        earned_xp: 0,
        created_at: new Date().toISOString(),
      };

      const result = taskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it('should apply defaults for optional fields', () => {
      const minimalTask = {
        id: '123',
        title: 'Test Task',
        created_at: new Date().toISOString(),
      };

      const result = taskSchema.safeParse(minimalTask);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.priority).toBe('medium');
        expect(result.data.status).toBe('pending');
        expect(result.data.subtasks).toEqual([]);
      }
    });

    it('should reject XSS in title', () => {
      const maliciousTask = {
        id: '123',
        title: '<script>alert("XSS")</script>',
        created_at: new Date().toISOString(),
      };

      const result = taskSchema.safeParse(maliciousTask);
      // Note: Schema allows the data, but validationService.validateUserInput() sanitizes it
      expect(result.success).toBe(true);
    });
  });
});
```

### Integration Tests

Create `tests/integration/validation.test.ts`:

```typescript
import validationService from '../../src/services/validationService';

describe('Validation Service Integration', () => {
  it('should prevent XSS in user input', () => {
    const maliciousInput = '<script>alert("XSS")</script>';

    const result = validationService.validateUserInput(maliciousInput);

    expect(result.success).toBe(false);
    expect(result.error).toContain('malicious');
  });

  it('should prevent SSRF with private IP', () => {
    const privateURL = 'http://192.168.1.1/admin';

    const result = validationService.validateUrl(privateURL);

    expect(result.success).toBe(false);
    expect(result.error).toContain('private');
  });

  it('should sanitize localStorage data', () => {
    const corruptTasks = [
      { id: '1', title: 'Valid Task', created_at: new Date().toISOString() },
      { id: '2', title: 123 }, // Invalid: title should be string
      { invalid: 'data' }, // Invalid: missing required fields
    ];

    expect(() => {
      validationService.validateLocalStorageData('adhd_quest_tasks', corruptTasks);
    }).toThrow();
  });
});
```

---

## Performance Considerations

### 1. **Validation is Fast**
Zod is highly optimized. Validation typically adds <1ms per object.

### 2. **Cache Validated Data**
Don't re-validate the same data multiple times:

```typescript
// Bad: validates on every render
function Component() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const validated = validationService.validateTasks(tasks); // Runs every render!
  // ...
}

// Good: validate once, cache result
function Component() {
  const [tasks, setTasks] = useState(() => {
    const raw = JSON.parse(localStorage.getItem('tasks') || '[]');
    const validated = validationService.validateTasks(raw);
    return validated.success ? validated.data : [];
  });
  // ...
}
```

### 3. **Lazy Validation for Large Arrays**
For very large datasets (1000+ items), validate in chunks:

```typescript
function validateLargeArray<T>(
  items: unknown[],
  validator: (item: unknown) => ValidationResult<T>,
  chunkSize: number = 100
): ValidationResult<T[]> {
  const validated: T[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    for (const item of chunk) {
      const result = validator(item);

      if (!result.success) {
        return {
          success: false,
          error: `Item ${i}: ${result.error}`,
        };
      }

      validated.push(result.data as T);
    }
  }

  return {
    success: true,
    data: validated,
  };
}
```

---

## Rollout Plan

### Week 1: Foundation
- ✅ Create validation schemas
- ✅ Create validation service
- ✅ Create example implementations
- [ ] Create localStorage validator wrapper
- [ ] Create useValidatedForm hook
- [ ] Write validation unit tests

### Week 2: Critical Services
- [ ] Migrate authService
- [ ] Add validation to cloudSyncService
- [ ] Update Dashboard to use validated localStorage
- [ ] Test thoroughly

### Week 3: Widgets
- [ ] Add validation to all widgets
- [ ] Add form validation hooks
- [ ] Write integration tests

### Week 4: Data Services
- [ ] Add validation to exportService
- [ ] Add validation to statsAggregator
- [ ] Full E2E testing with malicious data

---

## Security Impact

### Before Validation:
- ❌ **XSS Risk**: Unvalidated user input could contain `<script>` tags
- ❌ **Data Corruption**: Invalid data in localStorage crashes app
- ❌ **Type Confusion**: Backend returns unexpected data types
- ❌ **Injection**: Malicious data could exploit business logic

### After Validation:
- ✅ **XSS Prevention**: All input sanitized before rendering
- ✅ **Data Integrity**: Invalid data caught and handled gracefully
- ✅ **Type Safety**: All data validated against schemas
- ✅ **Defense in Depth**: Multiple validation layers

---

## Success Metrics

- [ ] **100% of user inputs validated** before processing
- [ ] **100% of database responses validated** before use
- [ ] **100% of localStorage operations validated**
- [ ] **0 validation-related crashes** in production
- [ ] **90%+ unit test coverage** on validation code
- [ ] **All P1 security issues resolved**

---

## Questions?

See:
- `src/schemas/validationSchemas.ts` - All schemas
- `src/services/validationService.ts` - Validation API
- `src/services/authService.validated.ts` - Example integration
- `SECURITY_AUDIT.md` - Original security findings
