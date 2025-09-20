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
  startDate: z.string().describe("The start date of the study plan in 'yyyy-MM-dd' format."),
  dailyStudyTime: z.string().describe('The amount of time to study each day (e.g., "2 hours").'),
  skillLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The skill level of the user.'),
  language: z.string().describe('The preferred language for the study materials.'),
});
export type GeneratePersonalizedStudyScheduleInput = z.infer<
  typeof GeneratePersonalizedStudyScheduleInputSchema
>;

const ScheduleItemSchema = z.object({
  day: z.string().describe("The day number (e.g., 'Day 1')."),
  date: z.string().describe("The date for the study session in 'yyyy-MM-dd' format."),
  topic: z.string().describe("The sub-topic to be covered on this day."),
  tasks: z.string().describe("A brief description of the tasks or goals for the day."),
});

const GeneratePersonalizedStudyScheduleOutputSchema = z.object({
  schedule: z.array(ScheduleItemSchema).describe('The generated day-by-day study schedule.'),
  notes: z.string().describe('Introductory notes for the main topics in the study plan, formatted in Markdown.'),
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
  1.  **Create a Study Schedule**: Generate a day-by-day study plan for the specified duration. The schedule should be an array of objects, where each object contains "day", "date", "topic", and "tasks". The 'date' must be in 'yyyy-MM-dd' format. Break down the main topic into smaller, manageable sub-topics for each day.
  2.  **Generate Introductory Notes**: For each of the main sub-topics identified in the schedule, create concise introductory notes. Format these notes using Markdown. Use headings, bold text for key terms, and bullet points for lists.
  3.  **Include Rich Reference Links**: For each main sub-topic, include 2-3 relevant reference links. These should be high-quality resources like Wikipedia articles, Khan Academy videos, relevant YouTube tutorials, or official documentation (like W3Schools for web development topics). The goal is to provide a rich set of external resources similar to what a dedicated resource curator would find.

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
