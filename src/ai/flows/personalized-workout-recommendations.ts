'use server';
/**
 * @fileOverview Flow for generating personalized workout recommendations based on user data.
 *
 * - personalizedWorkoutRecommendations - A function that generates workout recommendations.
 * - PersonalizedWorkoutRecommendationsInput - The input type for the personalizedWorkoutRecommendations function.
 * - PersonalizedWorkoutRecommendationsOutput - The return type for the personalizedWorkoutRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedWorkoutRecommendationsInputSchema = z.object({
  activities: z.string().describe('A description of tracked activities, e.g., running, swimming, cycling.'),
  goals: z.string().describe('A description of fitness goals, e.g., daily steps, weekly distance, calories burned.'),
  bmi: z.number().describe('The user BMI.'),
});
export type PersonalizedWorkoutRecommendationsInput = z.infer<typeof PersonalizedWorkoutRecommendationsInputSchema>;

const PersonalizedWorkoutRecommendationsOutputSchema = z.object({
  workoutRecommendations: z.string().describe('Personalized workout recommendations based on activities, goals and BMI, formatted as a markdown list.'),
});
export type PersonalizedWorkoutRecommendationsOutput = z.infer<typeof PersonalizedWorkoutRecommendationsOutputSchema>;

export async function personalizedWorkoutRecommendations(input: PersonalizedWorkoutRecommendationsInput): Promise<PersonalizedWorkoutRecommendationsOutput> {
  return personalizedWorkoutRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedWorkoutRecommendationsPrompt',
  input: {schema: PersonalizedWorkoutRecommendationsInputSchema},
  output: {schema: PersonalizedWorkoutRecommendationsOutputSchema},
  prompt: `You are an expert personal fitness trainer. Based on the user's tracked activities, fitness goals, and BMI, create a detailed and professional weekly workout plan.

**User Data:**
- **Tracked Activities:** {{{activities}}}
- **Fitness Goals:** {{{goals}}}
- **BMI:** {{{bmi}}}

**Instructions:**
1.  Generate a workout plan for each day of the week (Monday to Sunday).
2.  **Format the output using markdown.** Use a sub-heading for each day (e.g., '### Monday: Cardio & Core').
3.  Under each day, use **bullet points** for the exercises in a step-by-step description.
4.  For each exercise, include details like sets, reps, or duration.
5.  Provide a "Rest Day" or "Active Recovery" suggestion for appropriate days.
6.  Your entire response should be the markdown content for the weekly plan, inside the 'workoutRecommendations' field of the JSON output.

**Example Format:**

### Monday: Cardio Focus
-   **Warm-up:** 5 minutes of light jogging
-   **Running:** 30 minutes at a steady pace
-   **Cool-down:** 5 minutes of stretching
`,
});

const personalizedWorkoutRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedWorkoutRecommendationsFlow',
    inputSchema: PersonalizedWorkoutRecommendationsInputSchema,
    outputSchema: PersonalizedWorkoutRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
