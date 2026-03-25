'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { createWorkoutAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function NewWorkoutForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to today and current time
  const now = new Date();
  const defaultDate = format(now, 'yyyy-MM-dd');
  const defaultTime = format(now, 'HH:mm');

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const input = {
        name: formData.get('name') as string,
        notes: (formData.get('notes') as string) || undefined,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
      };

      const result = await createWorkoutAction(input);

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Redirect client-side to dashboard with the created workout's date
      router.push(`/dashboard?date=${result.date}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create workout';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {/* Workout Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Chest & Triceps"
              maxLength={100}
              required
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              placeholder="Add notes about your workout (optional)"
              maxLength={500}
              disabled={loading}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Start Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={defaultDate}
                max={defaultDate}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Start Time *</Label>
              <Input
                id="time"
                name="time"
                type="time"
                defaultValue={defaultTime}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Workout'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" disabled={loading} asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
