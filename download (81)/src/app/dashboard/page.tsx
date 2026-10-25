'use client';

import StatsCards from '@/components/dashboard/stats-cards';
import ActivityTracker from '@/components/dashboard/activity-tracker';
import GoalTracker from '@/components/dashboard/goal-tracker';
import BmiCalculator from '@/components/dashboard/bmi-calculator';
import ProgressChart from '@/components/dashboard/progress-chart';
import PersonalizedRecommendations from '@/components/dashboard/personalized-recommendations';
import FoodLogTracker from '@/components/dashboard/food-log-tracker';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import type { Activity, Goal, UserProfile, FoodLog } from '@/lib/types';
import { useMemo } from 'react';

export default function DashboardPage() {
  const { user, firestore } = useFirebase();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const activitiesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'fitnessActivities') : null, [firestore, user]);
  const activitiesQuery = useMemoFirebase(() => activitiesRef ? query(activitiesRef, orderBy('timestamp', 'desc')) : null, [activitiesRef]);
  const { data: activities } = useCollection<Activity>(activitiesQuery);
  
  const foodLogsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'foodLogs') : null, [firestore, user]);
  const foodLogsQuery = useMemoFirebase(() => foodLogsRef ? query(foodLogsRef, orderBy('timestamp', 'desc')) : null, [foodLogsRef]);
  const { data: foodLogs } = useCollection<FoodLog>(foodLogsQuery);

  const goalsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'goals') : null, [firestore, user]);
  const { data: goals } = useCollection<Goal>(goalsRef);
  
  const progressChartQuery = useMemoFirebase(() => activitiesRef ? query(activitiesRef, orderBy('timestamp', 'desc'), limit(7)) : null, [activitiesRef]);
  const { data: progressData } = useCollection<Activity>(progressChartQuery);

  const chartData = (progressData?.map(d => ({ date: d.timestamp, calories: d.calories })) || []).reverse();
  
  const bmi = useMemo(() => {
    if (!userProfile || !userProfile.height || !userProfile.weight) return 0;
    const heightInMeters = userProfile.height / 100;
    return userProfile.weight / (heightInMeters * heightInMeters);
  }, [userProfile]);

  return (
    <div className="space-y-8 mb-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!</h1>
        <p className="text-muted-foreground">Here&apos;s a look at your health flow today.</p>
      </div>
      
      <StatsCards activities={activities || []} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <ActivityTracker initialActivities={activities || []} />
            <FoodLogTracker initialFoodLogs={foodLogs || []} />
        </div>
        <div className="space-y-8">
            <BmiCalculator userProfile={userProfile} />
            <GoalTracker initialGoals={goals || []} activities={activities || []} />
        </div>
      </div>

      <ProgressChart data={chartData} />

      {userProfile && (
        <PersonalizedRecommendations 
          activities={activities || []}
          goals={goals || []}
          bmi={bmi}
        />
      )}

    </div>
  );
}
