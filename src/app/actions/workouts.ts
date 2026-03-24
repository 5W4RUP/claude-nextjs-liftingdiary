'use server';

import { auth } from '@clerk/nextjs/server';
import { getWorkoutsByDate, getWorkoutStats } from '@/data/workouts';

export async function refetchWorkoutsForDate(dateString: string) {
  // Get authenticated user
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Fetch workouts and stats using server functions
    const [workouts, stats] = await Promise.all([
      getWorkoutsByDate(userId, dateString),
      getWorkoutStats(userId, dateString),
    ]);

    return {
      workouts,
      stats,
      error: null,
    };
  } catch (err) {
    console.error('Error loading dashboard data:', err);
    return {
      workouts: [],
      stats: {
        workoutCount: 0,
        totalTime: 0,
        totalExercises: 0,
        totalSets: 0,
      },
      error: 'Failed to load workouts. Please try again.',
    };
  }
}
