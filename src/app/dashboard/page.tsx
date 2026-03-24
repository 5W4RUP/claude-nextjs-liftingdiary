import { format } from 'date-fns';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getWorkoutsByDate, getWorkoutStats } from '@/data/workouts';
import DashboardDatePicker from '@/components/dashboard-date-picker';
import DashboardWorkouts from '@/components/dashboard-workouts';

type Workout = Awaited<ReturnType<typeof getWorkoutsByDate>>[number];
type Stats = Awaited<ReturnType<typeof getWorkoutStats>>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  // Get authenticated user
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const params = await searchParams;
  const selectedDate = params.date || format(new Date(), 'yyyy-MM-dd');

  let initialWorkouts: Workout[] = [];
  let initialStats: Stats = {
    workoutCount: 0,
    totalTime: 0,
    totalExercises: 0,
    totalSets: 0,
  };

  try {
    // Fetch initial workouts and stats using server functions
    [initialWorkouts, initialStats] = await Promise.all([
      getWorkoutsByDate(userId, selectedDate),
      getWorkoutStats(userId, selectedDate),
    ]);
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Track and view your workout sessions</p>
        </div>

        {/* Date Picker Section */}
        <DashboardDatePicker selectedDate={selectedDate} />

        {/* Workouts Section - Client Component */}
        <DashboardWorkouts
          initialWorkouts={initialWorkouts}
          initialStats={initialStats}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
