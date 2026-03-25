'use server';

import { z } from 'zod';
import { createWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().max(255, 'Name must be less than 255 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  startedAt: z.date().optional(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  // Validate input
  const validated = createWorkoutSchema.parse(input);

  try {
    const workout = await createWorkout(validated);
    return { success: true, data: workout };
  } catch (error) {
    console.error('Failed to create workout:', error);
    return { success: false, error: 'Failed to create workout' };
  }
}
