'use server';

/**
 * @fileOverview Provides BMI feedback and suggestions based on the user's BMI value.
 *
 * - getBmiFeedbackAndSuggestions - A function that takes a BMI value as input and returns feedback and suggestions.
 * - BmiFeedbackAndSuggestionsInput - The input type for the getBmiFeedbackAndSuggestions function.
 * - BmiFeedbackAndSuggestionsOutput - The return type for the getBmiFeedbackAndSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BmiFeedbackAndSuggestionsInputSchema = z.object({
  bmi: z.number().describe('The BMI value of the user.'),
});
export type BmiFeedbackAndSuggestionsInput = z.infer<
  typeof BmiFeedbackAndSuggestionsInputSchema
>;

const BmiFeedbackAndSuggestionsOutputSchema = z.object({
  feedback: z.string().describe('Feedback on the user\'s BMI.'),
  suggestions: z.string().describe('Suggestions for improving health based on the BMI.'),
});
export type BmiFeedbackAndSuggestionsOutput = z.infer<
  typeof BmiFeedbackAndSuggestionsOutputSchema
>;

export async function getBmiFeedbackAndSuggestions(
  input: BmiFeedbackAndSuggestionsInput
): Promise<BmiFeedbackAndSuggestionsOutput> {
  return bmiFeedbackAndSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bmiFeedbackAndSuggestionsPrompt',
  input: {schema: BmiFeedbackAndSuggestionsInputSchema},
  output: {schema: BmiFeedbackAndSuggestionsOutputSchema},
  prompt: `You are a helpful AI assistant that provides personalized feedback and suggestions based on a user's BMI (Body Mass Index).

  Given the user's BMI: {{bmi}}, provide:

  1.  Brief, encouraging feedback on their current BMI.
  2.  Specific, actionable suggestions for improving their health and maintaining a healthy lifestyle.  These suggestions should be tailored to the BMI value provided.
  `,
});

const bmiFeedbackAndSuggestionsFlow = ai.defineFlow(
  {
    name: 'bmiFeedbackAndSuggestionsFlow',
    inputSchema: BmiFeedbackAndSuggestionsInputSchema,
    outputSchema: BmiFeedbackAndSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
