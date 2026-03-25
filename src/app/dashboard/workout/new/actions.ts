'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createWorkout } from '@/data/workouts';
import { format } from 'date-fns';

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100),
  notes: z.string().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time'),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const validated = CreateWorkoutSchema.parse(input);
    const startedAt = new Date(`${validated.date}T${validated.time}:00`);

    await createWorkout(userId, {
      name: validated.name,
      notes: validated.notes || undefined,
      startedAt,
    });

    redirect(`/dashboard?date=${validated.date}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error; // Re-throw redirect errors
    }
    console.error('Error creating workout:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create workout');
  }
}
