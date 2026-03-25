# Authentication Standards

This document outlines the critical standards for authentication and authorization in the Lifting Diary Course project.

## Overview

This application uses **Clerk** for all authentication and user management. Clerk handles user sign-up, sign-in, session management, and profile management.

**NEVER** implement custom authentication. **ALWAYS** use Clerk.

## ✅ Authentication Pattern

### Server Component Authentication

All server components that require authentication MUST use Clerk's `auth()` function:

```typescript
// src/app/dashboard/page.tsx - Server Component
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // Get authenticated user
  const { userId } = await auth();

  // Redirect unauthenticated users
  if (!userId) {
    redirect('/');
  }

  // Now userId is guaranteed to exist
  // Use it for all database queries
  return <div>{/* ... */}</div>;
}
```

### Key Points
1. Always import from `@clerk/nextjs/server` in server components
2. Call `await auth()` to get the current user session
3. Check if `userId` exists and redirect if not
4. Pass `userId` to all data fetching functions
5. Never proceed with operations if `userId` is missing

## User Identification

### Using User ID

The `userId` from Clerk is a unique string identifier (e.g., `user_3BLJPzILqQx9UwR7HlVZo60QDnf`).

**ALWAYS** use this `userId` as the source of truth for user identification:

```typescript
// ✅ CORRECT - Use userId from auth()
const { userId } = await auth();
const workouts = await getWorkoutsByDate(userId, selectedDate);

// ❌ WRONG - Don't get user info from other sources
const userEmail = user.emailAddress; // Don't rely on this for queries
const userCustomId = user.customId; // Don't use custom fields for filtering
```

### No User Table Required

This application does **NOT** have a `users` table in the database. The `userId` from Clerk is stored directly in tables as a `text` field.

```typescript
// Schema example
export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // ← Clerk userId, NOT a foreign key
  name: text('name'),
  // ...
});
```

## Data Isolation (CRITICAL)

Every query MUST filter by `userId` to ensure users can only access their own data.

### ✅ CORRECT - Always filter by userId

```typescript
// src/data/workouts.ts
export async function getWorkoutsByDate(userId: string, dateString: string) {
  return await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId), // ✅ ESSENTIAL: User isolation
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, endOfDay)
      )
    );
}

export async function getWorkoutById(userId: string, workoutId: number) {
  return await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // ✅ CRITICAL: Verify ownership
      )
    )
    .limit(1);
}
```

### ❌ WRONG - Missing userId filter

```typescript
// ❌ DANGEROUS - No user isolation!
export async function getWorkoutById(workoutId: number) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId)); // ❌ Any user can access any workout!
}

// ❌ DANGEROUS - Gets ALL workouts for ALL users
export async function getAllWorkouts() {
  return await db.select().from(workouts); // ❌ No userId filter!
}
```

## Client Components

### Using Clerk Components

For UI elements, use Clerk's pre-built components in client components:

```typescript
// src/components/header.tsx
'use client';

import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="flex justify-between items-center">
      <h1>Lifting Diary Course</h1>
      <div className="flex gap-4">
        <ThemeToggle />
        <Show when="signed-out">
          <SignInButton mode="modal" />
          <SignUpButton mode="modal" />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
```

### Key Components
- **`<SignInButton />`** - Sign in modal
- **`<SignUpButton />`** - Sign up modal
- **`<UserButton />`** - User profile menu with sign out
- **`<Show when="signed-in">`** - Conditional rendering for authenticated users
- **`<Show when="signed-out">`** - Conditional rendering for unauthenticated users

## Server Actions with Authentication

Server actions must verify authentication before accessing user data:

```typescript
// src/app/actions/workouts.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { getWorkoutsByDate, getWorkoutStats } from '@/data/workouts';

export async function refetchWorkoutsForDate(dateString: string) {
  // ✅ ALWAYS verify user authentication
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // ✅ Pass userId to all data helpers
    const [workouts, stats] = await Promise.all([
      getWorkoutsByDate(userId, dateString),
      getWorkoutStats(userId, dateString),
    ]);

    return { workouts, stats, error: null };
  } catch (err) {
    console.error('Error loading data:', err);
    return {
      workouts: [],
      stats: { /* ... */ },
      error: 'Failed to load data',
    };
  }
}
```

## Protected Routes

To protect routes, use Clerk middleware or check authentication in the page:

### Option 1: Check in Server Component (Recommended)

```typescript
// src/app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/'); // Redirect unauthenticated users
  }

  // Route is now protected
  return <div>{/* ... */}</div>;
}
```

### Option 2: Clerk Middleware (Advanced)

For more complex route protection, configure Clerk middleware in `middleware.ts`.

## Session Management

Clerk automatically handles:
- ✅ Session creation after sign-in
- ✅ Session validation on each request
- ✅ Session cleanup on sign-out
- ✅ Token refresh and expiration
- ✅ Secure cookie storage

**Never manually manage sessions.** Trust Clerk's built-in session handling.

## Password Management

Clerk handles all password functionality:
- ✅ Secure password hashing
- ✅ Password reset flows
- ✅ Account recovery
- ✅ Password change management

**Never store passwords in the database.** Clerk manages all password operations.

## OAuth Integration

Clerk supports OAuth providers (Google, GitHub, etc.) out of the box. To enable:

1. Configure OAuth providers in Clerk dashboard
2. Users will see sign-in options automatically
3. No additional code needed

```typescript
// Clerk handles OAuth automatically
<SignInButton mode="modal" /> // Shows OAuth options
```

## Environment Variables

Required Clerk environment variables must be set:

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Never commit these to version control.

## Common Patterns

### Pattern 1: Protect Server Component

```typescript
// ✅ CORRECT
export default async function SecurePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const data = await getData(userId);
  return <div>{/* render data */}</div>;
}
```

### Pattern 2: Fetch User Data with Verification

```typescript
// ✅ CORRECT
export async function getWorkoutById(userId: string, workoutId: number) {
  const workout = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  if (!workout.length) {
    throw new Error('Workout not found');
  }

  return workout[0];
}
```

### Pattern 3: Update with Ownership Check

```typescript
// ✅ CORRECT
export async function updateWorkout(
  userId: string,
  workoutId: number,
  data: Partial<WorkoutInput>
) {
  // Verify ownership first
  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) {
    throw new Error('Unauthorized');
  }

  // Then update
  return await db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
}
```

## Summary

### ✅ DO
- ✅ Use `auth()` from `@clerk/nextjs/server` in server components
- ✅ Check if `userId` exists and redirect if not
- ✅ Pass `userId` to ALL database queries
- ✅ Filter by `userId` in every query (data isolation is critical)
- ✅ Use Clerk UI components for authentication UI
- ✅ Verify user ownership before updating/deleting their data
- ✅ Use server actions for sensitive operations with auth checks
- ✅ Trust Clerk's session management

### ❌ DON'T
- ❌ Implement custom authentication
- ❌ Store passwords in the database
- ❌ Query data without filtering by `userId`
- ❌ Skip ownership checks before updates/deletes
- ❌ Use auth() in client components
- ❌ Manually manage sessions
- ❌ Expose sensitive user data to the client
- ❌ Allow unauthenticated access to protected data
