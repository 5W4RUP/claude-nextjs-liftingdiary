'use server';

import { db } from '@/db';
import { workouts, workoutExercises, exercises, sets } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function getWorkoutsByDate(userId: string, dateString: string) {
  // Parse the date string (yyyy-MM-dd)
  const [year, month, day] = dateString.split('-').map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

  try {
    // Fetch workouts for the given date and user using Drizzle ORM
    const userWorkouts = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId), // ✅ CRITICAL: Filter by userId
          gte(workouts.startedAt, startOfDay),
          lt(workouts.startedAt, endOfDay)
        )
      )
      .orderBy(workouts.startedAt);

    // For each workout, fetch exercises and sets
    const workoutsWithDetails = await Promise.all(
      userWorkouts.map(async (workout) => {
        // Get workout exercises
        const workoutExercisesList = await db
          .select()
          .from(workoutExercises)
          .where(eq(workoutExercises.workoutId, workout.id))
          .orderBy(workoutExercises.orderIndex);

        // Get exercises and sets for each workout exercise
        const exercisesWithSets = await Promise.all(
          workoutExercisesList.map(async (we) => {
            // Get exercise details
            const exerciseData = await db
              .select()
              .from(exercises)
              .where(eq(exercises.id, we.exerciseId))
              .limit(1);

            // Get sets for this exercise
            const setsList = await db
              .select()
              .from(sets)
              .where(eq(sets.workoutExerciseId, we.id))
              .orderBy(sets.setNumber);

            return {
              ...we,
              exercise: exerciseData[0],
              sets: setsList,
            };
          })
        );

        return {
          ...workout,
          workoutExercises: exercisesWithSets,
        };
      })
    );

    return workoutsWithDetails;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw new Error('Failed to fetch workouts');
  }
}

export async function getWorkoutById(userId: string, workoutId: number) {
  try {
    // Get workout and verify it belongs to the user
    const workoutData = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.id, workoutId),
          eq(workouts.userId, userId) // ✅ CRITICAL: Verify ownership
        )
      )
      .limit(1);

    if (!workoutData.length) {
      throw new Error('Workout not found');
    }

    const workout = workoutData[0];

    // Get workout exercises
    const workoutExercisesList = await db
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workout.id))
      .orderBy(workoutExercises.orderIndex);

    // Get exercises and sets for each workout exercise
    const exercisesWithSets = await Promise.all(
      workoutExercisesList.map(async (we) => {
        const exerciseData = await db
          .select()
          .from(exercises)
          .where(eq(exercises.id, we.exerciseId))
          .limit(1);

        const setsList = await db
          .select()
          .from(sets)
          .where(eq(sets.workoutExerciseId, we.id))
          .orderBy(sets.setNumber);

        return {
          ...we,
          exercise: exerciseData[0],
          sets: setsList,
        };
      })
    );

    return {
      ...workout,
      workoutExercises: exercisesWithSets,
    };
  } catch (error) {
    console.error('Error fetching workout:', error);
    throw new Error('Failed to fetch workout');
  }
}

export async function getWorkoutStats(userId: string, dateString: string) {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    // Get all workouts for the day
    const dayWorkouts = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          gte(workouts.startedAt, startOfDay),
          lt(workouts.startedAt, endOfDay)
        )
      );

    // Calculate stats
    let totalTime = 0;
    let totalExercises = 0;
    let totalSets = 0;

    for (const workout of dayWorkouts) {
      if (workout.completedAt && workout.startedAt) {
        totalTime += (workout.completedAt.getTime() - workout.startedAt.getTime()) / 60000;
      }

      const exercisesList = await db
        .select()
        .from(workoutExercises)
        .where(eq(workoutExercises.workoutId, workout.id));

      totalExercises += exercisesList.length;

      for (const exercise of exercisesList) {
        const setsList = await db
          .select()
          .from(sets)
          .where(eq(sets.workoutExerciseId, exercise.id));

        totalSets += setsList.length;
      }
    }

    return {
      workoutCount: dayWorkouts.length,
      totalTime: Math.round(totalTime),
      totalExercises,
      totalSets,
    };
  } catch (error) {
    console.error('Error calculating workout stats:', error);
    throw new Error('Failed to calculate stats');
  }
}
