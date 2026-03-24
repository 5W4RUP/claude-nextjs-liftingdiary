# Data Fetching Standards

This document outlines the critical standards for data fetching and database operations in the Lifting Diary Course project.

## ⚠️ CRITICAL: Server Components ONLY

**ALL data fetching in this application MUST be done via server components.**

### Allowed Data Fetching Methods
✅ **Server Components** - THE ONLY way to fetch data
✅ **Helper functions in `/data` directory** - Used by server components

### Forbidden Data Fetching Methods
❌ **Route Handlers** - DO NOT fetch data via route handlers
❌ **Client Components** - DO NOT fetch data in client components using effects or hooks
❌ **API Routes** - DO NOT create data fetching API routes
❌ **Any other method** - Only server components + data helpers

**Why?** Server components ensure secure data fetching, prevent client-side data exposure, and maintain data consistency.

## Server Component Data Fetching Pattern

### ✅ CORRECT Pattern

```tsx
// src/app/dashboard/page.tsx - Server Component
import { getWorkoutsByDate } from '@/data/workouts';

export default async function DashboardPage() {
  // Fetch data in server component
  const workouts = await getWorkoutsByDate(userId, selectedDate);

  return (
    <div>
      {workouts.map(workout => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
```

### ❌ WRONG Patterns

```tsx
// ❌ WRONG - Fetching in client component
'use client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => {
    // ❌ DO NOT DO THIS
    fetch('/api/workouts').then(r => r.json()).then(setWorkouts);
  }, []);
  return <div>{/* ... */}</div>;
}
```

```tsx
// ❌ WRONG - Using route handlers
// pages/api/workouts.ts
export async function GET(req) {
  // ❌ DO NOT DO THIS - Use server components instead
  const workouts = await db.select().from(workouts).execute();
  return Response.json(workouts);
}
```

## Data Helper Functions

### Location
All database queries MUST be in the `/data` directory:

```
src/
├── data/
│   ├── workouts.ts      # Workout-related queries
│   ├── exercises.ts     # Exercise-related queries
│   ├── users.ts         # User-related queries
│   └── auth.ts          # Authentication-related queries
```

### Structure

Each helper function MUST:
1. Accept `userId` as a parameter
2. Filter data by `userId` (critical for security)
3. Use Drizzle ORM (never raw SQL)
4. Handle errors gracefully
5. Return typed data

### ✅ Example: Correct Helper Function

```typescript
// src/data/workouts.ts
'use server';

import { db } from '@/db';
import { workouts, workoutExercises, exercises, sets } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function getWorkoutsByDate(
  userId: string,
  dateString: string
) {
  // Parse date
  const [year, month, day] = dateString.split('-').map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

  try {
    // ✅ Use Drizzle ORM
    // ✅ ALWAYS filter by userId (security critical!)
    const userWorkouts = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          gte(workouts.startedAt, startOfDay),
          lt(workouts.startedAt, endOfDay)
        )
      )
      .orderBy(workouts.startedAt);

    return userWorkouts;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw new Error('Failed to fetch workouts');
  }
}

export async function getWorkoutById(userId: string, workoutId: number) {
  try {
    // ✅ Filter by BOTH workoutId AND userId
    const workout = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.id, workoutId),
          eq(workouts.userId, userId) // ✅ CRITICAL: User isolation
        )
      )
      .limit(1);

    if (!workout.length) {
      throw new Error('Workout not found');
    }

    return workout[0];
  } catch (error) {
    console.error('Error fetching workout:', error);
    throw new Error('Failed to fetch workout');
  }
}

export async function createWorkout(userId: string, data: WorkoutInput) {
  try {
    // ✅ Always include userId when creating
    const result = await db
      .insert(workouts)
      .values({
        userId,
        name: data.name,
        notes: data.notes,
        startedAt: data.startedAt,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error creating workout:', error);
    throw new Error('Failed to create workout');
  }
}

export async function updateWorkout(
  userId: string,
  workoutId: number,
  data: Partial<WorkoutInput>
) {
  try {
    // ✅ Verify ownership before updating
    const workout = await getWorkoutById(userId, workoutId);
    if (!workout) {
      throw new Error('Unauthorized: Workout not found');
    }

    // ✅ Use Drizzle ORM update
    const result = await db
      .update(workouts)
      .set(data)
      .where(
        and(
          eq(workouts.id, workoutId),
          eq(workouts.userId, userId)
        )
      )
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error updating workout:', error);
    throw new Error('Failed to update workout');
  }
}

export async function deleteWorkout(userId: string, workoutId: number) {
  try {
    // ✅ Verify ownership before deleting
    const workout = await getWorkoutById(userId, workoutId);
    if (!workout) {
      throw new Error('Unauthorized: Workout not found');
    }

    // ✅ Use Drizzle ORM delete
    const result = await db
      .delete(workouts)
      .where(
        and(
          eq(workouts.id, workoutId),
          eq(workouts.userId, userId)
        )
      )
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw new Error('Failed to delete workout');
  }
}
```

## ⚠️ CRITICAL: User Data Isolation

Every query MUST include user isolation:

### ✅ CORRECT - Always filter by userId

```typescript
const userWorkouts = await db
  .select()
  .from(workouts)
  .where(
    and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId)  // ✅ ESSENTIAL
    )
  );
```

### ❌ WRONG - Missing userId filter

```typescript
// ❌ DANGEROUS - No user isolation!
const workout = await db
  .select()
  .from(workouts)
  .where(eq(workouts.id, workoutId));  // ❌ Any user can access any workout!
```

### Security Violation Examples

These would expose user data and MUST NEVER happen:

```typescript
// ❌ WRONG - Gets ALL workouts for ALL users
const allWorkouts = await db.select().from(workouts);

// ❌ WRONG - Gets workouts for any user
const workouts = await db
  .select()
  .from(workouts)
  .where(eq(workouts.startedAt, someDate));

// ❌ WRONG - No userId check, allows data leakage
async function getWorkoutByName(workoutName: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.name, workoutName));
}
```

## Drizzle ORM Requirements

### ✅ ALWAYS Use Drizzle ORM

```typescript
// ✅ Correct - Using Drizzle ORM
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const result = await db
  .select()
  .from(workouts)
  .where(
    and(
      eq(workouts.userId, userId),
      eq(workouts.id, workoutId)
    )
  );
```

### ❌ NEVER Use Raw SQL

```typescript
// ❌ FORBIDDEN - Raw SQL
const result = await db.execute(`
  SELECT * FROM workouts WHERE user_id = $1 AND id = $2
`, [userId, workoutId]);

// ❌ FORBIDDEN - String interpolation
const query = `SELECT * FROM workouts WHERE id = ${workoutId}`;

// ❌ FORBIDDEN - Template literals
const result = await db.query(`
  SELECT * FROM workouts WHERE user_id = '${userId}'
`);
```

**Why no raw SQL?**
- SQL injection vulnerabilities
- Type safety loss
- No IDE autocomplete
- Harder to maintain
- Drizzle handles all of this safely

## Server Component Usage

### ✅ CORRECT - Server Component with Data Helper

```typescript
// src/app/dashboard/page.tsx
import { getWorkoutsByDate } from '@/data/workouts';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  // Get authenticated user
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  try {
    // Fetch data using helper function
    const workouts = await getWorkoutsByDate(userId, selectedDate);

    return (
      <div>
        {workouts.map(workout => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>
    );
  } catch (error) {
    return <ErrorComponent message="Failed to load workouts" />;
  }
}
```

### Key Points
1. Server component can use `await`
2. Pass `userId` to all helper functions
3. Handle errors gracefully
4. Never expose errors to client without sanitization

## Client Component Usage

### ✅ CORRECT - Client Component Receiving Props

```typescript
// src/components/workout-card.tsx
'use client';

interface WorkoutCardProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  // Client component receives pre-fetched data as props
  // NO data fetching here

  return (
    <Card>
      <CardHeader>
        <CardTitle>{workout.name}</CardTitle>
      </CardHeader>
      {/* ... */}
    </Card>
  );
}
```

### Key Points
1. Client components receive data as props
2. Client components add interactivity only
3. NO data fetching in client components
4. NO useEffect with fetch/API calls

## Error Handling

### ✅ CORRECT Error Handling

```typescript
export async function getWorkout(userId: string, workoutId: number) {
  try {
    const workout = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.id, workoutId),
          eq(workouts.userId, userId)
        )
      )
      .limit(1);

    if (!workout.length) {
      throw new Error('Workout not found');
    }

    return workout[0];
  } catch (error) {
    // Log for debugging
    console.error('Database error:', error);

    // Throw sanitized error to client
    if (error instanceof Error) {
      throw new Error('Failed to fetch workout');
    }

    throw new Error('An unexpected error occurred');
  }
}
```

## Summary

### ✅ DO
- ✅ Fetch data in **server components only**
- ✅ Use helper functions in **`/data` directory**
- ✅ Use **Drizzle ORM** for queries
- ✅ **Always filter by userId** (data isolation)
- ✅ Pass **userId to all queries**
- ✅ Handle errors gracefully
- ✅ Pass fetched data to client components as props

### ❌ DON'T
- ❌ Fetch data in client components
- ❌ Use route handlers for data fetching
- ❌ Create API routes for data access
- ❌ Use raw SQL queries
- ❌ Skip userId filters in queries
- ❌ Allow users to access others' data
- ❌ Expose database errors to clients
- ❌ Fetch data without authentication checks

