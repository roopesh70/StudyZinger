'use server';
/**
 * @fileOverview A flow that generates a daily motivational quote.
 *
 * - getDailyMotivationalQuote - A function that returns a daily motivational quote.
 * - DailyMotivationalQuoteOutput - The return type for the getDailyMotivationalQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyMotivationalQuoteOutputSchema = z.object({
  quote: z.string().describe('A daily motivational quote.'),
});
export type DailyMotivationalQuoteOutput = z.infer<typeof DailyMotivationalQuoteOutputSchema>;

export async function getDailyMotivationalQuote(): Promise<DailyMotivationalQuoteOutput> {
  return dailyMotivationalQuoteFlow();
}

const prompt = ai.definePrompt({
  name: 'dailyMotivationalQuotePrompt',
  output: {schema: DailyMotivationalQuoteOutputSchema},
  prompt: `You are a motivational speaker. Generate a short motivational quote to inspire students.`,
});

const dailyMotivationalQuoteFlow = ai.defineFlow({
  name: 'dailyMotivationalQuoteFlow',
  outputSchema: DailyMotivationalQuoteOutputSchema,
}, async () => {
  const {output} = await prompt({});
  return output!;
});