'use client';

import { format, startOfToday, startOfWeek, endOfWeek } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DashboardDatePickerProps {
  selectedDate: string;
}

export default function DashboardDatePicker({
  selectedDate,
}: DashboardDatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value; // Format: yyyy-MM-dd
    const params = new URLSearchParams(searchParams);
    params.set('date', newDate);
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleToday = () => {
    const today = format(startOfToday(), 'yyyy-MM-dd');
    const params = new URLSearchParams(searchParams);
    params.set('date', today);
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleThisWeek = () => {
    const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
    const params = new URLSearchParams(searchParams);
    params.set('date', weekStart);
    router.push(`/dashboard?${params.toString()}`);
  };

  const displayDate = format(
    new Date(selectedDate + 'T00:00:00'),
    'do MMM yyyy'
  );

  return (
    <div className="mb-8 p-6 border rounded-lg bg-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <Label htmlFor="date-picker" className="mb-2 block">
            Select Date
          </Label>
          <Input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full sm:max-w-xs"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Viewing workouts for {displayDate}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleThisWeek}
          >
            This Week
          </Button>
        </div>
      </div>
    </div>
  );
}
