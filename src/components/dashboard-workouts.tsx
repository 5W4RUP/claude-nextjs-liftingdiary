'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { refetchWorkoutsForDate } from '@/app/actions/workouts';

interface Workout {
  id: number;
  userId: string;
  name: string | null;
  notes: string | null;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  workoutExercises?: Array<{
    id: number;
    workoutId: number;
    exerciseId: number;
    orderIndex: number;
    notes: string | null;
    createdAt: Date;
    sets?: Array<{
      id: number;
      workoutExerciseId: number;
      setNumber: number;
      reps: number | null;
      weightKg: number | null;
      durationSeconds: number | null;
      rpe: number | null;
      isWarmup: boolean;
      completedAt: Date | null;
      createdAt: Date;
    }>;
  }>;
}

interface Stats {
  workoutCount: number;
  totalTime: number;
  totalExercises: number;
  totalSets: number;
}

interface DashboardWorkoutsProps {
  initialWorkouts: Workout[];
  initialStats: Stats;
  selectedDate: string;
}

export default function DashboardWorkouts({
  initialWorkouts,
  initialStats,
  selectedDate,
}: DashboardWorkoutsProps) {
  const searchParams = useSearchParams();
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousDateRef = useRef<string>(selectedDate);

  // Refetch workouts when the date param changes
  useEffect(() => {
    const currentDate = searchParams.get('date') || selectedDate;

    // Only refetch if the date actually changed
    if (currentDate !== previousDateRef.current) {
      previousDateRef.current = currentDate;
      setLoading(true);
      setError(null);

      refetchWorkoutsForDate(currentDate)
        .then((result) => {
          setWorkouts(result.workouts);
          setStats(result.stats);
          setError(result.error);
        })
        .catch((err) => {
          console.error('Error refetching workouts:', err);
          setError('Failed to load workouts. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchParams, selectedDate]);

  return (
    <>
      {/* Error State */}
      {error && (
        <Card className="mb-8 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Workouts List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Workouts</h2>
            <p className="text-muted-foreground text-sm">
              {loading ? 'Loading...' : `${workouts.length} workout${workouts.length !== 1 ? 's' : ''} logged`}
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/workout/new">+ New Workout</Link>
          </Button>
        </div>

        {/* Workouts Grid */}
        {workouts.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {workouts.map((workout) => {
              const duration =
                workout.completedAt && workout.startedAt
                  ? Math.round((workout.completedAt.getTime() - workout.startedAt.getTime()) / 60000)
                  : 0;

              const exerciseCount = workout.workoutExercises?.length || 0;
              const setCount = workout.workoutExercises?.reduce(
                (sum, ex) => sum + (ex.sets?.length || 0),
                0
              ) || 0;

              return (
                <Card key={workout.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{workout.name || 'Workout'}</CardTitle>
                        <CardDescription className="mt-1">
                          {format(new Date(workout.startedAt), 'h:mm a')}
                          {workout.completedAt && ` - ${format(new Date(workout.completedAt), 'h:mm a')}`}
                        </CardDescription>
                      </div>
                      {duration > 0 && <Badge variant="secondary">{duration} min</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Workout Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">
                          Exercises
                        </p>
                        <p className="text-2xl font-bold">{exerciseCount}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">
                          Sets
                        </p>
                        <p className="text-2xl font-bold">{setCount}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">
                          Duration
                        </p>
                        <p className="text-2xl font-bold">{duration}m</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {workout.notes && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm text-foreground">{workout.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <p className="text-lg font-semibold text-muted-foreground mb-4">
                  No workouts logged yet
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Start by logging your first workout for{' '}
                  {format(new Date(selectedDate + 'T00:00:00'), 'do MMM yyyy')}
                </p>
                <Button>+ Log Workout</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>
            Your workout summary for {format(new Date(selectedDate + 'T00:00:00'), 'do MMM yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Workouts</p>
              <p className="text-3xl font-bold">{stats.workoutCount}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Time</p>
              <p className="text-3xl font-bold">
                {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Total Exercises
              </p>
              <p className="text-3xl font-bold">{stats.totalExercises}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Sets</p>
              <p className="text-3xl font-bold">{stats.totalSets}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
