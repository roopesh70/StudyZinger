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
  topic: z.string().describe('The topic to study.'),
  duration: z.string().describe('The total duration of the study plan (e.g., "2 weeks", "1 month").'),
  startDate: z.string().describe('The start date of the study plan.'),
  dailyStudyTime: z.string().describe('The amount of time to study each day (e.g., "2 hours").'),
  skillLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The skill level of the user.'),
  language: z.string().describe('The preferred language for the study materials.'),
});
export type GeneratePersonalizedStudyScheduleInput = z.infer<
  typeof GeneratePersonalizedStudyScheduleInputSchema
>;

const GeneratePersonalizedStudyScheduleOutputSchema = z.object({
  schedule: z.string().describe('The generated study schedule, formatted as a markdown table.'),
  notes: z.string().describe('Introductory notes for the main topics in the study plan.'),
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
  prompt: `You are an expert study planner and note creator. Create a detailed, personalized study schedule and introductory notes based on the following user requirements.

  Topic: {{{topic}}}
  Study Duration: {{{duration}}}
  Start Date: {{{startDate}}}
  Daily Study Time: {{{dailyStudyTime}}}
  Skill Level: {{{skillLevel}}}
  Language: {{{language}}}

  Instructions:
  1.  **Create a Study Schedule**: Generate a day-by-day study plan for the specified duration. The schedule should be in a markdown table format with columns for "Day", "Date", "Topic", and "Tasks". Break down the main topic into smaller, manageable sub-topics for each day.
  2.  **Generate Introductory Notes**: For each of the main sub-topics identified in the schedule, create concise introductory notes. These notes should provide a brief overview, key concepts, and important definitions. This will serve as a starting point for the user's study sessions.

  Output the schedule and notes in the specified JSON format.
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
    return output!;
  }
);
