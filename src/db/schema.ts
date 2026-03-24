import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  real,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Exercise catalog - global or user-created exercises
 */
export const exercises = pgTable(
  'exercises',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    category: text('category'),
    muscleGroup: text('muscle_group'),
    equipment: text('equipment'),
    instructions: text('instructions'),
    isCustom: boolean('is_custom').notNull().default(false),
    createdByUserId: text('created_by_user_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_exercises_name').on(table.name),
    index('idx_exercises_created_by').on(table.createdByUserId),
  ]
);

/**
 * Workouts - a single training session
 */
export const workouts = pgTable(
  'workouts',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    name: text('name'),
    notes: text('notes'),
    startedAt: timestamp('started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_workouts_user_id').on(table.userId)]
);

/**
 * Workout exercises - junction table linking workouts to exercises with ordering
 */
export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id: serial('id').primaryKey(),
    workoutId: integer('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: integer('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    orderIndex: integer('order_index').notNull().default(0),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_we_workout_id').on(table.workoutId),
    index('idx_we_exercise_id').on(table.exerciseId),
    uniqueIndex('unique_we_workout_order').on(table.workoutId, table.orderIndex),
  ]
);

/**
 * Sets - individual set records (reps, weight, etc.)
 */
export const sets = pgTable(
  'sets',
  {
    id: serial('id').primaryKey(),
    workoutExerciseId: integer('workout_exercise_id')
      .notNull()
      .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber: integer('set_number').notNull(),
    reps: integer('reps'),
    weightKg: real('weight_kg'),
    durationSeconds: integer('duration_seconds'),
    rpe: real('rpe'),
    isWarmup: boolean('is_warmup').notNull().default(false),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_sets_workout_exercise_id').on(table.workoutExerciseId),
  ]
);

/**
 * Relations - enable db.query.* relational API
 */
export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one, many }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(sets),
  })
);

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));
