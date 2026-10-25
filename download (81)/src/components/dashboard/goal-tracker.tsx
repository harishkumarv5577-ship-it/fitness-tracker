'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import type { Goal, Activity } from '@/lib/types';
import { isWithinInterval, parseISO } from 'date-fns';

interface GoalTrackerProps {
  initialGoals: Goal[];
  activities: Activity[];
}

export default function GoalTracker({ initialGoals, activities }: GoalTrackerProps) {
  const goalsWithProgress = useMemo(() => {
    return initialGoals.map((goal) => {
      const currentProgress = activities
        .filter((activity) => {
          try {
            const activityDate = parseISO(activity.timestamp);
            const startDate = parseISO(goal.startDate);
            const endDate = parseISO(goal.endDate);
            
            return isWithinInterval(activityDate, { start: startDate, end: endDate });
          } catch (e) {
            return false;
          }
        })
        .reduce((sum, activity) => {
          if (goal.goalType === 'steps') return sum + (activity.steps || 0);
          if (goal.goalType === 'distance') return sum + (activity.distance || 0);
          if (goal.goalType === 'calories') return sum + (activity.calories || 0);
          return sum;
        }, 0);

      return {
        ...goal,
        current: currentProgress,
      };
    });
  }, [initialGoals, activities]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-6 h-6" />
          <span>Goal Progress</span>
        </CardTitle>
        <CardDescription>Your current progress towards your fitness goals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {goalsWithProgress.length > 0 ? (
          goalsWithProgress.map((goal) => {
            const percentage = Math.min(Math.round((goal.current / goal.targetValue) * 100), 100);
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium capitalize">{goal.goalType}</span>
                  <span className="text-xs text-muted-foreground">
                    {goal.current.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-[10px] text-muted-foreground text-right">
                  {percentage}% complete
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">You haven&apos;t set any goals yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
