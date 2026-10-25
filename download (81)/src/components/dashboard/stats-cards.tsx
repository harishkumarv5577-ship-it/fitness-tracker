'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Flame, Route, Footprints } from 'lucide-react';
import type { Activity } from '@/lib/types';
import { useMemo } from 'react';

interface StatsCardsProps {
  activities: Activity[];
}

export default function StatsCards({ activities }: StatsCardsProps) {
  const stats = useMemo(() => {
    const totalActivities = activities.length;
    const totalCalories = activities.reduce((sum, act) => sum + act.calories, 0);
    const totalDistance = activities.reduce((sum, act) => sum + (act.distance || 0), 0);
    const totalSteps = activities.reduce((sum, act) => sum + (act.steps || 0), 0);
    return { totalActivities, totalCalories, totalDistance, totalSteps };
  }, [activities]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalActivities}</div>
          <p className="text-xs text-muted-foreground">Workouts this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCalories.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total kcal burned</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Steps</CardTitle>
          <Footprints className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSteps.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total steps taken</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
          <Route className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDistance.toFixed(1)} km</div>
          <p className="text-xs text-muted-foreground">Total distance covered</p>
        </CardContent>
      </Card>
    </div>
  );
}
