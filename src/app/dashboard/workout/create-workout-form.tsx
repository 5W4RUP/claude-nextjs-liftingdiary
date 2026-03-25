'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createWorkoutAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CreateWorkoutFormProps {
  userId: string;
}

export function CreateWorkoutForm({ userId }: CreateWorkoutFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const name = formData.get('name') as string;
    const notes = formData.get('notes') as string;

    const result = await createWorkoutAction({
      userId,
      name: name || undefined,
      notes: notes || undefined,
      startedAt: new Date(),
    });

    if (result.success) {
      router.push(`/dashboard/workout/${result.data.id}`);
    } else {
      setError(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name (Optional)</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Chest and Triceps"
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">
              Give your workout a descriptive name
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any notes about this workout..."
              maxLength={1000}
              className="min-h-24"
            />
            <p className="text-xs text-muted-foreground">
              Maximum 1000 characters
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Create Workout
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
