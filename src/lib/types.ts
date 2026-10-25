'use client';
import { Footprints, Fish, Bike, Dumbbell, Apple, LucideIcon } from 'lucide-react';

export type ActivityType = 'Running' | 'Swimming' | 'Cycling' | 'Workout';

export const activityIcons: Record<ActivityType, LucideIcon> = {
    Running: Footprints,
    Swimming: Fish,
    Cycling: Bike,
    Workout: Dumbbell,
};

export interface Activity {
  id: string;
  type: ActivityType;
  duration: number; // in minutes
  distance?: number; // in km
  calories: number;
  steps?: number;
  heartRate?: number; // average bpm
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
  userProfileId: string;
}

export interface Goal {
    id: string;
    userProfileId: string;
    goalType: 'steps' | 'distance' | 'calories';
    targetValue: number;
    unit: string;
    timeFrame: string;
    startDate: string;
    endDate: string;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    dateJoined: any; 
    height: number; // in cm
    weight: number; // in kg
}

export interface BmiRecord {
    id: string;
    userProfileId: string;
    height: number;
    weight: number;
    bmi: number;
    timestamp: string;
}

export interface FoodLog {
  id: string;
  userProfileId: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foodName: string;
  calories: number;
  protein: number;
  photoUrl?: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
}
