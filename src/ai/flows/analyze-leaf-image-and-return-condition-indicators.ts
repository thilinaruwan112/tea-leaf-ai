'use server';
/**
 * @fileOverview Analyzes tea leaf images to assess their health and provide condition indicators.
 *
 * - analyzeLeafImageAndReturnConditionIndicators - Analyzes the tea leaf image and returns condition indicators.
 * - AnalyzeLeafImageAndReturnConditionIndicatorsInput - The input type for the analyzeLeafImageAndReturnConditionIndicators function.
 * - AnalyzeLeafImageAndReturnConditionIndicatorsOutput - The return type for the analyzeLeafImageAndReturnConditionIndicators function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLeafImageAndReturnConditionIndicatorsInputSchema = z.object({
  leafImageDataUri: z
    .string()
    .describe(
      "A photo of tea leaves, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeLeafImageAndReturnConditionIndicatorsInput = z.infer<
  typeof AnalyzeLeafImageAndReturnConditionIndicatorsInputSchema
>;

const QualityMetricSchema = z.object({
  name: z
    .string()
    .describe(
      'The name of the quality metric (e.g., "Color", "Texture", "Ripeness").'
    ),
  value: z
    .number()
    .describe('The quality score for this metric, from 0 to 100.'),
});

const AnalyzeLeafImageAndReturnConditionIndicatorsOutputSchema = z.object({
  conditionIndicators: z
    .array(z.string())
    .describe('The condition indicators of the tea leaves.'),
  recommendedActions: z
    .string()
    .describe('The recommended actions based on the assessed leaf conditions.'),
  qualityMetrics: z
    .array(QualityMetricSchema)
    .describe(
      'A list of quality metrics with their percentage values (e.g., Color, Texture, Ripeness).'
    ),
});
export type AnalyzeLeafImageAndReturnConditionIndicatorsOutput = z.infer<
  typeof AnalyzeLeafImageAndReturnConditionIndicatorsOutputSchema
>;

export async function analyzeLeafImageAndReturnConditionIndicators(
  input: AnalyzeLeafImageAndReturnConditionIndicatorsInput
): Promise<AnalyzeLeafImageAndReturnConditionIndicatorsOutput> {
  return analyzeLeafImageAndReturnConditionIndicatorsFlow(input);
}

const analyzeLeafImageAndReturnConditionIndicatorsPrompt = ai.definePrompt({
  name: 'analyzeLeafImageAndReturnConditionIndicatorsPrompt',
  input: {schema: AnalyzeLeafImageAndReturnConditionIndicatorsInputSchema},
  output: {schema: AnalyzeLeafImageAndReturnConditionIndicatorsOutputSchema},
  prompt: `You are an expert tea leaf health analyst. You will analyze the provided image of tea leaves to determine their condition, recommend actions, and provide quality metrics.

  Analyze the tea leaves in the image and extract key condition indicators. List these indicators.

  Based on the condition indicators, recommend specific actions to improve the health and quality of the tea leaves.

  Provide a quality analysis with percentage scores for the following metrics: Color, Texture, and Ripeness.

  Image: {{media url=leafImageDataUri}}
  `,
});

const analyzeLeafImageAndReturnConditionIndicatorsFlow = ai.defineFlow(
  {
    name: 'analyzeLeafImageAndReturnConditionIndicatorsFlow',
    inputSchema: AnalyzeLeafImageAndReturnConditionIndicatorsInputSchema,
    outputSchema: AnalyzeLeafImageAndReturnConditionIndicatorsOutputSchema,
  },
  async input => {
    const {output} = await analyzeLeafImageAndReturnConditionIndicatorsPrompt(
      input
    );
    return output!;
  }
);
