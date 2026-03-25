# Data Mutations Standards

This document outlines the critical standards for all data mutations (CREATE, UPDATE, DELETE operations) in the Lifting Diary Course project.

## Overview

Data mutations in this application follow a strict pattern:

1. **Data helper functions** in `/src/data` directory wrap all database operations via Drizzle ORM
2. **Server actions** in colocated `actions.ts` files handle user requests and call the helpers
3. **Zod validation** validates all inputs before mutations
4. **User isolation** is enforced on every mutation via userId filtering

## Architecture

```
Client Component
      ↓
  Server Action (actions.ts)
      ↓
Zod Validation
      ↓
Data Helper (src/data)
      ↓
Drizzle ORM
      ↓
Database
```

## Data Helper Functions

### Location

All database mutation functions MUST be in the `/src/data` directory:

```
src/
├── data/
│   ├── workouts.ts      # Workout mutations
│   ├── exercises.ts     # Exercise mutations
│   ├── users.ts         # User-related mutations
│   └── index.ts         # Exports
```

### Structure

Every data helper MUST:

1. Use `'use server'` directive
2. Accept `userId` as the first parameter (for user isolation)
3. Use Drizzle ORM (never raw SQL)
4. Filter by `userId` on updates/deletes
5. Return typed results
6. Handle errors gracefully
7. Be a pure database operation (no validation here)

### ✅ CORRECT Pattern

```typescript
// src/data/workouts.ts
'use server';

import { db } from '@/db';
import { workouts, workoutExercises, exercises, sets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface CreateWorkoutInput {
  name: string;
  notes?: string;
  startedAt: Date;
  completedAt?: Date;
}

// CREATE
export async function createWorkout(userId: string, input: CreateWorkoutInput) {
  try {
    const result = await db
      .insert(workouts)
      .values({
        userId, // ✅ ALWAYS include userId
        name: input.name,
        notes: input.notes,
        startedAt: input.startedAt,
        completedAt: input.completedAt,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error creating workout:', error);
    throw new Error('Failed to create workout');
  }
}

// UPDATE
export async function updateWorkout(
  userId: string,
  workoutId: number,
  input: Partial<CreateWorkoutInput>
) {
  try {
    // ✅ Verify ownership before updating
    const workout = await db
      .select()
      .from(workouts)
      .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
      .limit(1);

    if (!workout.length) {
      throw new Error('Workout not found');
    }

    // ✅ Filter by BOTH id AND userId
    const result = await db
      .update(workouts)
      .set({
        name: input.name,
        notes: input.notes,
        startedAt: input.startedAt,
        completedAt: input.completedAt,
      })
      .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error updating workout:', error);
    throw new Error('Failed to update workout');
  }
}

// DELETE
export async function deleteWorkout(userId: string, workoutId: number) {
  try {
    // ✅ Verify ownership before deleting
    const workout = await db
      .select()
      .from(workouts)
      .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
      .limit(1);

    if (!workout.length) {
      throw new Error('Workout not found');
    }

    // ✅ Filter by BOTH id AND userId
    const result = await db
      .delete(workouts)
      .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw new Error('Failed to delete workout');
  }
}
```

### ❌ WRONG Patterns

```typescript
// ❌ WRONG - Missing userId
export async function createWorkout(input: CreateWorkoutInput) {
  // No userId parameter!
  return await db.insert(workouts).values(input);
}

// ❌ WRONG - Update without ownership check
export async function updateWorkout(workoutId: number, input: Partial<CreateWorkoutInput>) {
  return await db
    .update(workouts)
    .set(input)
    .where(eq(workouts.id, workoutId)); // ❌ No userId filter!
}

// ❌ WRONG - Using raw SQL
export async function deleteWorkout(userId: string, workoutId: number) {
  return await db.execute(
    `DELETE FROM workouts WHERE id = $1 AND user_id = $2`,
    [workoutId, userId]
  ); // ❌ Use Drizzle ORM!
}
```

## Server Actions

### Location

Server actions MUST be in colocated `actions.ts` files in the same directory as the pages/components that use them:

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── actions.ts      ← Server actions for dashboard
│   ├── workouts/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts  ← Server actions for workout detail
│   │   └── actions.ts      ← Server actions for workout list
```

### Structure

Every server action MUST:

1. Use `'use server'` directive
2. Have fully typed parameters (NOT `FormData`)
3. Validate all inputs with Zod
4. Authenticate the user
5. Call data helper functions
6. Return typed results
7. Handle errors and return error messages

### ✅ CORRECT Pattern

```typescript
// src/app/dashboard/actions.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createWorkout, updateWorkout, deleteWorkout } from '@/data/workouts';

// ✅ Define schema BEFORE the server action
const CreateWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100),
  notes: z.string().max(500).optional(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

// ✅ Server action with typed parameters
export async function createWorkoutAction(input: CreateWorkoutInput) {
  try {
    // ✅ Authenticate user
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // ✅ Validate input with Zod
    const validatedInput = CreateWorkoutSchema.parse(input);

    // ✅ Call data helper
    const workout = await createWorkout(userId, validatedInput);

    return {
      success: true,
      data: workout,
      error: null,
    };
  } catch (error) {
    console.error('Error creating workout:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create workout',
    };
  }
}

// ✅ Update server action
const UpdateWorkoutSchema = CreateWorkoutSchema.partial();

type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

export async function updateWorkoutAction(
  workoutId: number,
  input: UpdateWorkoutInput
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const validatedInput = UpdateWorkoutSchema.parse(input);
    const workout = await updateWorkout(userId, workoutId, validatedInput);

    return {
      success: true,
      data: workout,
      error: null,
    };
  } catch (error) {
    console.error('Error updating workout:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update workout',
    };
  }
}

// ✅ Delete server action
export async function deleteWorkoutAction(workoutId: number) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    await deleteWorkout(userId, workoutId);

    return {
      success: true,
      data: null,
      error: null,
    };
  } catch (error) {
    console.error('Error deleting workout:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to delete workout',
    };
  }
}
```

### Using Server Actions in Client Components

```typescript
// src/components/create-workout-form.tsx
'use client';

import { useState } from 'react';
import { createWorkoutAction } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateWorkoutForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Extract data and pass as typed object
      const input = {
        name: formData.get('name') as string,
        notes: formData.get('notes') as string,
        startedAt: new Date(formData.get('startedAt') as string),
      };

      // ✅ Call server action with typed input
      const result = await createWorkoutAction(input);

      if (!result.success) {
        setError(result.error);
      } else {
        // Handle success
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit}>
      <Input
        name="name"
        placeholder="Workout name"
        required
        disabled={loading}
      />
      <Input
        name="notes"
        placeholder="Notes"
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Workout'}
      </Button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
```

### ❌ WRONG Patterns

```typescript
// ❌ WRONG - Using FormData in server action
export async function createWorkoutAction(formData: FormData) {
  // ❌ FormData is not typed!
  const name = formData.get('name');
}

// ❌ WRONG - No validation
export async function createWorkoutAction(input: any) {
  // ❌ No Zod validation!
  const workout = await createWorkout(userId, input);
}

// ❌ WRONG - No authentication check
export async function deleteWorkoutAction(workoutId: number) {
  // ❌ Missing auth check!
  await deleteWorkout(unknownUserId, workoutId);
}

// ❌ WRONG - Untyped parameters
export async function updateWorkoutAction(data: any) {
  // ❌ No types!
  const workout = await updateWorkout(userId, data.id, data.input);
}
```

## Zod Validation

### Schema Definition

Define Zod schemas alongside server actions:

```typescript
// src/app/dashboard/actions.ts
import { z } from 'zod';

// ✅ Define schemas at module level
const CreateWorkoutSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  notes: z.string()
    .max(500, 'Notes must be 500 characters or less')
    .optional(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
});

const UpdateExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['push', 'pull', 'legs', 'other']).optional(),
  equipment: z.string().optional(),
});

// ✅ Extract TypeScript types from schemas
type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;
type UpdateExerciseInput = z.infer<typeof UpdateExerciseSchema>;
```

### Validation in Server Actions

```typescript
// ✅ CORRECT - Parse and handle errors
export async function createWorkoutAction(input: CreateWorkoutInput) {
  try {
    // ✅ Validate with schema
    const validatedInput = CreateWorkoutSchema.parse(input);

    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const workout = await createWorkout(userId, validatedInput);

    return { success: true, data: workout, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // ✅ Return first validation error
      return {
        success: false,
        data: null,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}
```

## Error Handling

### Data Helpers

Data helpers should throw errors:

```typescript
// src/data/workouts.ts
export async function deleteWorkout(userId: string, workoutId: number) {
  const workout = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  if (!workout.length) {
    throw new Error('Workout not found'); // ✅ Throw error
  }

  return await db.delete(workouts).where(/* ... */);
}
```

### Server Actions

Server actions should catch errors and return structured results:

```typescript
// src/app/dashboard/actions.ts
export async function deleteWorkoutAction(workoutId: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    await deleteWorkout(userId, workoutId);

    return { success: true, error: null }; // ✅ Return success
  } catch (error) {
    // ✅ Catch and return error
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete',
    };
  }
}
```

## User Data Isolation

### CRITICAL: Filter by userId on Updates/Deletes

Every UPDATE and DELETE operation MUST filter by `userId`:

```typescript
// ✅ CORRECT
export async function updateWorkout(
  userId: string,
  workoutId: number,
  input: Partial<CreateWorkoutInput>
) {
  return await db
    .update(workouts)
    .set(input)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // ✅ ESSENTIAL
      )
    )
    .returning();
}

// ❌ WRONG - Missing userId filter
export async function updateWorkout(workoutId: number, input: any) {
  return await db
    .update(workouts)
    .set(input)
    .where(eq(workouts.id, workoutId)); // ❌ Any user can modify any workout!
}
```

### CRITICAL: Verify Ownership Before Delete

```typescript
// ✅ CORRECT
export async function deleteWorkout(userId: string, workoutId: number) {
  // Verify ownership first
  const workout = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  if (!workout.length) {
    throw new Error('Workout not found');
  }

  return await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
}
```

## Common Patterns

### Pattern 1: Simple Create

```typescript
// Data helper
export async function createExercise(
  userId: string,
  input: CreateExerciseInput
) {
  return await db
    .insert(exercises)
    .values({ ...input, createdByUserId: userId })
    .returning();
}

// Server action
export async function createExerciseAction(input: CreateExerciseInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const validated = CreateExerciseSchema.parse(input);
    const exercise = await createExercise(userId, validated);

    return { success: true, data: exercise, error: null };
  } catch (error) {
    // ... error handling
  }
}
```

### Pattern 2: Create with Related Records

```typescript
// Data helper
export async function createWorkoutWithExercises(
  userId: string,
  workoutInput: CreateWorkoutInput,
  exerciseIds: number[]
) {
  const workout = await db
    .insert(workouts)
    .values({ userId, ...workoutInput })
    .returning();

  // Add exercises
  if (exerciseIds.length > 0) {
    await db.insert(workoutExercises).values(
      exerciseIds.map((exerciseId, index) => ({
        workoutId: workout[0].id,
        exerciseId,
        orderIndex: index,
      }))
    );
  }

  return workout[0];
}

// Server action
export async function createWorkoutWithExercisesAction(
  workoutInput: CreateWorkoutInput,
  exerciseIds: number[]
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const validatedWorkout = CreateWorkoutSchema.parse(workoutInput);
    const validatedExerciseIds = z.array(z.number()).parse(exerciseIds);

    const workout = await createWorkoutWithExercises(
      userId,
      validatedWorkout,
      validatedExerciseIds
    );

    return { success: true, data: workout, error: null };
  } catch (error) {
    // ... error handling
  }
}
```

### Pattern 3: Conditional Update

```typescript
// Data helper
export async function completeWorkout(
  userId: string,
  workoutId: number
) {
  return await db
    .update(workouts)
    .set({ completedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
}

// Server action
export async function completeWorkoutAction(workoutId: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const workout = await completeWorkout(userId, workoutId);

    return { success: true, data: workout, error: null };
  } catch (error) {
    // ... error handling
  }
}
```

## Summary

### ✅ DO
- ✅ Define data helpers in `/src/data` with `'use server'`
- ✅ Always accept `userId` as first parameter
- ✅ Filter by `userId` on every UPDATE and DELETE
- ✅ Define server actions in colocated `actions.ts` files
- ✅ Use fully typed parameters (NOT `FormData`)
- ✅ Validate all inputs with Zod before mutations
- ✅ Verify user authentication in server actions
- ✅ Use Drizzle ORM for all database operations
- ✅ Return structured success/error responses
- ✅ Handle Zod validation errors gracefully

### ❌ DON'T
- ❌ Fetch/mutate data directly in components
- ❌ Use `FormData` in server actions
- ❌ Skip validation with Zod
- ❌ Mutate data without user authentication
- ❌ Update/delete without filtering by `userId`
- ❌ Use raw SQL queries
- ❌ Skip ownership verification before deletions
- ❌ Expose database errors to the client
- ❌ Pass untyped parameters to server actions
- ❌ Mix data helpers and server actions in same file
