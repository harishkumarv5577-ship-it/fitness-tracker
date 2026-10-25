'use server';
/**
 * @fileOverview Flow for generating a diet plan suggestion based on a user's goal (bulk or cut).
 * 
 * - dietPlanSuggestion - A function that generates a diet plan.
 * - DietPlanSuggestionInput - The input type for the dietPlanSuggestion function.
 * - DietPlanSuggestionOutput - The return type for the dietPlanSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DietPlanSuggestionInputSchema = z.object({
  goal: z.enum(['bulk', 'cut']).describe('The user\'s primary fitness goal: "bulk" for muscle gain or "cut" for weight loss.'),
  bmi: z.number().describe('The user\'s Body Mass Index (BMI).'),
  dietaryPreference: z.enum(['vegetarian', 'non-vegetarian']).describe('The user\'s dietary preference.'),
  medicalCondition: z.string().describe('Any medical condition the user has (e.g., "None", "Diabetes", "High Blood Pressure", or a custom condition).'),
});
export type DietPlanSuggestionInput = z.infer<typeof DietPlanSuggestionInputSchema>;

const DietPlanSuggestionOutputSchema = z.object({
  dietPlan: z.string().describe('A detailed 1-day diet plan formatted as a markdown string. Include headings for each meal (Breakfast, Lunch, Snacks, Dinner) and provide step-by-step descriptions for the meals.'),
});
export type DietPlanSuggestionOutput = z.infer<typeof DietPlanSuggestionOutputSchema>;


export async function dietPlanSuggestion(input: DietPlanSuggestionInput): Promise<DietPlanSuggestionOutput> {
  return dietPlanSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dietPlanSuggestionPrompt',
  input: { schema: DietPlanSuggestionInputSchema },
  output: { schema: DietPlanSuggestionOutputSchema },
  prompt: `You are an expert nutritionist. Create a single-day diet plan for a user based on their fitness goal, BMI, dietary preference, and medical condition.

**User Goal:** {{{goal}}}
**User BMI:** {{{bmi}}}
**Dietary Preference:** {{{dietaryPreference}}}
**Medical Condition:** {{#if medicalCondition}}"{{{medicalCondition}}}"{{else}}"None"{{/if}}

**Instructions:**
1.  Generate a diet plan for **one full day**.
2.  The plan must be tailored to the user's dietary preference ({{dietaryPreference}}).
3.  The plan should be tailored to the user's goal:
    *   **Bulk:** Higher calorie and protein intake for muscle gain.
    *   **Cut:** Lower calorie intake with sufficient protein for fat loss while preserving muscle.
4.  If a medical condition is specified and is not 'None', adjust the plan accordingly. For example, for 'Diabetes', suggest low-glycemic foods. For 'Heart Patient' or 'Blood Pressure', suggest low-sodium options. For other conditions, use your expert knowledge to create a suitable plan. **If condition is 'None', create a general healthy plan.**
5.  Structure the response as a single markdown string.
6.  Use a main heading for the plan (e.g., "### Daily Bulking Diet Plan").
7.  Include four sections with subheadings: **### Breakfast**, **### Lunch**, **### Snacks**, and **### Dinner**. The order must be exactly as listed.
8.  For each meal, provide a descriptive, step-by-step guide. Be specific about food items and quantities.
9.  Ensure the language is encouraging and professional.
10. The entire response must be the markdown content for the daily plan, placed inside the 'dietPlan' field of the JSON output.`,
});

const dietPlanSuggestionFlow = ai.defineFlow(
  {
    name: 'dietPlanSuggestionFlow',
    inputSchema: DietPlanSuggestionInputSchema,
    outputSchema: DietPlanSuggestionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
