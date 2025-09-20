'use server';
/**
 * @fileOverview This file defines a Genkit flow for curating external study resources.
 *
 * The flow takes a subtopic as input and returns a list of relevant external resources like Khan Academy videos and Wikipedia articles.
 *
 * @exported curateExternalStudyResources - The main function to curate external study resources.
 * @exported CurateExternalStudyResourcesInput - The input type for the curateExternalStudyResources function.
 * @exported CurateExternalStudyResourcesOutput - The output type for the curateExternalStudyResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CurateExternalStudyResourcesInputSchema = z.object({
  subtopic: z.string().describe('The subtopic to curate external resources for.'),
});
export type CurateExternalStudyResourcesInput = z.infer<typeof CurateExternalStudyResourcesInputSchema>;

const CurateExternalStudyResourcesOutputSchema = z.object({
  resources: z.array(
    z.object({
      title: z.string().describe('The title of the resource.'),
      url: z.string().url().describe('The URL of the resource.'),
      description: z.string().describe('A brief description of the resource.'),
    })
  ).describe('A list of relevant external resources.'),
});
export type CurateExternalStudyResourcesOutput = z.infer<typeof CurateExternalStudyResourcesOutputSchema>;

export async function curateExternalStudyResources(input: CurateExternalStudyResourcesInput): Promise<CurateExternalStudyResourcesOutput> {
  return curateExternalStudyResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'curateExternalStudyResourcesPrompt',
  input: {schema: CurateExternalStudyResourcesInputSchema},
  output: {schema: CurateExternalStudyResourcesOutputSchema},
  prompt: `You are an AI assistant designed to curate a list of external resources for a given subtopic.
  Your goal is to find relevant and helpful resources like Khan Academy videos and Wikipedia articles that can help students deepen their understanding of the material.

  Subtopic: {{{subtopic}}}

  Please provide a list of resources with the following information for each resource:
  - title: The title of the resource.
  - url: The URL of the resource.
  - description: A brief description of the resource.
`,
});

const curateExternalStudyResourcesFlow = ai.defineFlow(
  {
    name: 'curateExternalStudyResourcesFlow',
    inputSchema: CurateExternalStudyResourcesInputSchema,
    outputSchema: CurateExternalStudyResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
