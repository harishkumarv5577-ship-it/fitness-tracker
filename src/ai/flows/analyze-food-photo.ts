'use server';
/**
 * @fileOverview Flow for analyzing a food photo to identify the meal and estimate nutritional content.
 * 
 * - analyzeFoodPhoto - A function that takes a food photo and returns its analysis.
 * - AnalyzeFoodPhotoInput - The input type for the analyzeFoodPhoto function.
 * - AnalyzeFoodPhotoOutput - The return type for the analyzeFoodPhoto function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeFoodPhotoInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeFoodPhotoInput = z.infer<typeof AnalyzeFoodPhotoInputSchema>;

const AnalyzeFoodPhotoOutputSchema = z.object({
  foodName: z.string().describe("The identified name of the food or meal. Be as specific as possible (e.g., 'Scrambled eggs with a side of bacon')."),
  calories: z.number().describe("The estimated total calorie count for the meal."),
  protein: z.number().describe("The estimated total protein in grams for the meal."),
});
export type AnalyzeFoodPhotoOutput = z.infer<typeof AnalyzeFoodPhotoOutputSchema>;

export async function analyzeFoodPhoto(input: AnalyzeFoodPhotoInput): Promise<AnalyzeFoodPhotoOutput> {
  return analyzeFoodPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodPhotoPrompt',
  input: { schema: AnalyzeFoodPhotoInputSchema },
  output: { schema: AnalyzeFoodPhotoOutputSchema },
  prompt: `You are an expert nutritionist and food recognition specialist. Analyze the provided image of a meal.

Your task is to:
1. Identify the food items in the image.
2. Provide a descriptive name for the overall meal.
3. Estimate the total calorie count for the entire meal shown.
4. Estimate the total protein content in grams for the entire meal shown.

Analyze the following image: {{media url=photoDataUri}}

Return the result as a JSON object adhering to the specified output schema. Be as accurate as possible with your estimations based on the visual information.`,
});

const analyzeFoodPhotoFlow = ai.defineFlow(
  {
    name: 'analyzeFoodPhotoFlow',
    inputSchema: AnalyzeFoodPhotoInputSchema,
    outputSchema: AnalyzeFoodPhotoOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
