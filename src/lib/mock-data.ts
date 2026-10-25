import type { Activity, Goal, User } from '@/lib/types';
import { subDays } from 'date-fns';

export const mockUser: User = {
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
    height: 175,
    weight: 70,
};

export const mockActivities: Activity[] = [
    {
        id: '1',
        type: 'Running',
        duration: 30,
        distance: 5,
        calories: 300,
        date: subDays(new Date(), 1).toISOString(),
    },
    {
        id: '2',
        type: 'Workout',
        duration: 60,
        calories: 400,
        date: subDays(new Date(), 2).toISOString(),
    },
    {
        id: '3',
        type: 'Swimming',
        duration: 45,
        distance: 1.5,
        calories: 350,
        date: subDays(new Date(), 4).toISOString(),
    },
    {
        id: '4',
        type: 'Cycling',
        duration: 75,
        distance: 20,
        calories: 500,
        date: subDays(new Date(), 6).toISOString(),
    },
];

export const mockGoals: Goal[] = [
    {
        id: '1',
        type: 'calories',
        title: 'Weekly Calories Burned',
        target: 3500,
        current: 1550,
        unit: 'kcal',
    },
    {
        id: '2',
        type: 'distance',
        title: 'Weekly Running Distance',
        target: 20,
        current: 5,
        unit: 'km',
    },
    {
        id: '3',
        type: 'steps',
        title: 'Daily Steps',
        target: 10000,
        current: 7800,
        unit: 'steps',
    },
];

export const mockProgressData = [
  { date: subDays(new Date(), 6).toLocaleDateString(), calories: 500 },
  { date: subDays(new Date(), 5).toLocaleDateString(), calories: 450 },
  { date: subDays(new Date(), 4).toLocaleDateString(), calories: 350 },
  { date: subDays(new Date(), 3).toLocaleDateString(), calories: 600 },
  { date: subDays(new Date(), 2).toLocaleDateString(), calories: 400 },
  { date: subDays(new Date(), 1).toLocaleDateString(), calories: 300 },
  { date: new Date().toLocaleDateString(), calories: 700 },
];
