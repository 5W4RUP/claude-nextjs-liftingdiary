import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NewWorkoutForm } from './new-workout-form';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Create Workout',
  description: 'Create a new workout session',
};

export default async function NewWorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">← Back</Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Create New Workout</h1>
          <p className="text-muted-foreground text-lg">
            Log a new workout session. Add exercises later if needed.
          </p>
        </div>

        {/* Form */}
        <NewWorkoutForm />
      </div>
    </div>
  );
}
