'use server';
/**
 * @fileOverview A flow that generates notes for a specific topic.
 *
 * - getNotesForTopic - A function that returns notes for a given topic.
 * - GetNotesForTopicInput - The input type for the getNotesForTopic function.
 * - GetNotesForTopicOutput - The return type for the getNotesForTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetNotesForTopicInputSchema = z.object({
  topic: z.string().describe('The topic to generate notes for.'),
});
export type GetNotesForTopicInput = z.infer<typeof GetNotesForTopicInputSchema>;

const GetNotesForTopicOutputSchema = z.object({
  notes: z
    .string()
    .describe(
      'Detailed notes for the topic in Markdown format, including reference links.'
    ),
});
export type GetNotesForTopicOutput = z.infer<typeof GetNotesForTopicOutputSchema>;

export async function getNotesForTopic(
  input: GetNotesForTopicInput
): Promise<GetNotesForTopicOutput> {
  return getNotesForTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getNotesForTopicPrompt',
  input: {schema: GetNotesForTopicInputSchema},
  output: {schema: GetNotesForTopicOutputSchema},
  prompt: `You are an expert tutor. For the given topic, create a concise set of study notes in Markdown format.

Topic: {{{topic}}}

Instructions:
1.  **Format Notes**: Use Markdown with headings, bold text for key terms, and bullet points for lists.
2.  **Include Rich Reference Links**: Include 2-3 relevant reference links. These should be high-quality resources like Wikipedia articles, Khan Academy videos, relevant YouTube tutorials, or official documentation.

Output the notes in the specified JSON format.
`,
});

const getNotesForTopicFlow = ai.defineFlow(
  {
    name: 'getNotesForTopicFlow',
    inputSchema: GetNotesForTopicInputSchema,
    outputSchema: GetNotesForTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
