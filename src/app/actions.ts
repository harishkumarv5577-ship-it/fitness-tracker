'use server';

import { getBmiFeedbackAndSuggestions } from '@/ai/flows/bmi-feedback-and-suggestions';
import { personalizedWorkoutRecommendations } from '@/ai/flows/personalized-workout-recommendations';
import type { Activity, Goal } from '@/lib/types';
import { analyzeFoodPhoto } from '@/ai/flows/analyze-food-photo';
import { dietPlanSuggestion, type DietPlanSuggestionInput } from '@/ai/flows/diet-plan-suggestion';

export async function getBmiFeedbackAction(bmi: number) {
  try {
    const result = await getBmiFeedbackAndSuggestions({ bmi });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: 'Failed to get BMI feedback.' };
  }
}

interface RecommendationParams {
  activities: Activity[];
  goals: Goal[];
  bmi: number;
}

export async function getPersonalizedRecommendationsAction({ activities, goals, bmi }: RecommendationParams) {
  try {
    const activitiesString = activities.map(a => `${a.type}: ${a.duration} mins, ${a.calories} kcal`).join('; ');
    const goalsString = goals.map(g => `${g.goalType}: ${g.targetValue} ${g.unit}`).join('; ');

    const result = await personalizedWorkoutRecommendations({
      activities: activitiesString,
      goals: goalsString,
      bmi,
    });
    return { success: true, data: result.workoutRecommendations };
  } catch (error: any) {
    const errorMessage = error.message || 'An unexpected error occurred while generating recommendations.';
    return { success: false, error: `Failed to get recommendations: ${errorMessage}` };
  }
}

export async function analyzeFoodPhotoAction(photoDataUri: string) {
  try {
    const result = await analyzeFoodPhoto({ photoDataUri });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to analyze food photo.' };
  }
}

export async function getDietPlanAction(input: DietPlanSuggestionInput) {
    try {
        const result = await dietPlanSuggestion(input);
        return { success: true, data: result.dietPlan };
    } catch (error: any) {
        const errorMessage = error.message || 'An unexpected error occurred while generating the diet plan.';
        return { success: false, error: `Failed to get diet plan: ${errorMessage}` };
    }
}
