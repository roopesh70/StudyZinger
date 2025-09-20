// src/ai/flows/generate-personalized-study-schedule.ts
'use server';
/**
 * @fileOverview Generates a personalized study schedule based on the subject matter and difficulty level.
 *
 * - generatePersonalizedStudySchedule - A function that generates the study schedule.
 * - GeneratePersonalizedStudyScheduleInput - The input type for the generatePersonalizedStudySchedule function.
 * - GeneratePersonalizedStudyScheduleOutput - The return type for the generatePersonalizedStudySchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedStudyScheduleInputSchema = z.object({
  subject: z.string().describe('The subject matter to study.'),
  difficultyLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The difficulty level of the subject matter.'),
});
export type GeneratePersonalizedStudyScheduleInput = z.infer<
  typeof GeneratePersonalizedStudyScheduleInputSchema
>;

const GeneratePersonalizedStudyScheduleOutputSchema = z.object({
  schedule: z.string().describe('The generated study schedule.'),
  progress: z.string().describe('Progress summary of schedule generation.'),
});
export type GeneratePersonalizedStudyScheduleOutput = z.infer<
  typeof GeneratePersonalizedStudyScheduleOutputSchema
>;

export async function generatePersonalizedStudySchedule(
  input: GeneratePersonalizedStudyScheduleInput
): Promise<GeneratePersonalizedStudyScheduleOutput> {
  return generatePersonalizedStudyScheduleFlow(input);
}

const generatePersonalizedStudySchedulePrompt = ai.definePrompt({
  name: 'generatePersonalizedStudySchedulePrompt',
  input: {schema: GeneratePersonalizedStudyScheduleInputSchema},
  output: {schema: GeneratePersonalizedStudyScheduleOutputSchema},
  prompt: `You are an expert study schedule generator. Generate a personalized study schedule for the following subject and difficulty level:

Subject: {{{subject}}}
Difficulty Level: {{{difficultyLevel}}}

The study schedule should be detailed and easy to follow. It should include specific topics to study and the amount of time to spend on each topic. The schedule should change based on the difficulty that the user is facing with the material.

Make it no more than 7 days long.

Schedule:
`,
});

const generatePersonalizedStudyScheduleFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedStudyScheduleFlow',
    inputSchema: GeneratePersonalizedStudyScheduleInputSchema,
    outputSchema: GeneratePersonalizedStudyScheduleOutputSchema,
  },
  async input => {
    const {output} = await generatePersonalizedStudySchedulePrompt(input);
    return {
      ...output!,
      progress: 'Generated a personalized study schedule based on subject and difficulty.',
    };
  }
);
