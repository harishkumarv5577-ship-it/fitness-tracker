'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/bmi-feedback-and-suggestions.ts';
import '@/ai/flows/personalized-workout-recommendations.ts';
import '@/ai/flows/analyze-food-photo.ts';
import '@/ai/flows/diet-plan-suggestion.ts';
