'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing action recommendations based on the condition of tea leaves.
 *
 * - provideActionRecommendations - A function that takes tea leaf conditions as input and returns recommended actions.
 * - ActionRecommendationsInput - The input type for the provideActionRecommendations function.
 * - ActionRecommendationsOutput - The output type for the provideActionRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActionRecommendationsInputSchema = z.object({
  conditionIndicators: z
    .string()
    .describe('A summary of the condition indicators of the tea leaves.'),
});
export type ActionRecommendationsInput = z.infer<
  typeof ActionRecommendationsInputSchema
>;

const ActionRecommendationsOutputSchema = z.object({
  recommendedActions: z
    .string()
    .describe('Recommended actions based on the tea leaf conditions.'),
});
export type ActionRecommendationsOutput = z.infer<
  typeof ActionRecommendationsOutputSchema
>;

export async function provideActionRecommendations(
  input: ActionRecommendationsInput
): Promise<ActionRecommendationsOutput> {
  return provideActionRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'actionRecommendationsPrompt',
  input: {schema: ActionRecommendationsInputSchema},
  output: {schema: ActionRecommendationsOutputSchema},
  prompt: `You are an expert tea farmer providing recommendations based on the condition of tea leaves. Based on the condition indicators provided, suggest the best course of action.

Condition Indicators: {{{conditionIndicators}}}

Provide clear, concise, and actionable recommendations for the tea farmer.`,
});

const provideActionRecommendationsFlow = ai.defineFlow(
  {
    name: 'provideActionRecommendationsFlow',
    inputSchema: ActionRecommendationsInputSchema,
    outputSchema: ActionRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
