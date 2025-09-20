'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing personalized study tips based on user progress and weak areas.
 *
 * - providePersonalizedStudyTips - A function that calls the personalized study tips flow.
 * - ProvidePersonalizedStudyTipsInput - The input type for the providePersonalizedStudyTips function.
 * - ProvidePersonalizedStudyTipsOutput - The return type for the providePersonalizedStudyTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvidePersonalizedStudyTipsInputSchema = z.object({
  progressSummary: z
    .string()
    .describe(
      'A summary of the user\'s study progress, including strong and weak areas.'
    ),
});
export type ProvidePersonalizedStudyTipsInput = z.infer<
  typeof ProvidePersonalizedStudyTipsInputSchema
>;

const ProvidePersonalizedStudyTipsOutputSchema = z.object({
  studyTips: z
    .string()
    .describe('Personalized study tips based on the user\'s progress.'),
});
export type ProvidePersonalizedStudyTipsOutput = z.infer<
  typeof ProvidePersonalizedStudyTipsOutputSchema
>;

export async function providePersonalizedStudyTips(
  input: ProvidePersonalizedStudyTipsInput
): Promise<ProvidePersonalizedStudyTipsOutput> {
  return providePersonalizedStudyTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'providePersonalizedStudyTipsPrompt',
  input: {schema: ProvidePersonalizedStudyTipsInputSchema},
  output: {schema: ProvidePersonalizedStudyTipsOutputSchema},
  prompt: `Based on the following study progress summary, provide personalized study tips to help the student improve their study habits and focus on areas that need more attention.\n\nProgress Summary: {{{progressSummary}}}\n\nStudy Tips:`,
});

const providePersonalizedStudyTipsFlow = ai.defineFlow(
  {
    name: 'providePersonalizedStudyTipsFlow',
    inputSchema: ProvidePersonalizedStudyTipsInputSchema,
    outputSchema: ProvidePersonalizedStudyTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
