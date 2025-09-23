'use server';
/**
 * @fileOverview A flow to send a daily study summary email to the user.
 *
 * - sendDailySummary - A function that sends an email with today's tasks.
 * - SendDailySummaryInput - The input type for the sendDailySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generate} from 'genkit';

const TaskSchema = z.object({
  topic: z.string(),
  tasks: z.string(),
});

const SendDailySummaryInputSchema = z.object({
  name: z.string().describe('The name of the user.'),
  email: z.string().email().describe('The email of the user.'),
  tasks: z.array(TaskSchema).describe("A list of tasks for the user to complete today."),
});
export type SendDailySummaryInput = z.infer<typeof SendDailySummaryInputSchema>;

export async function sendDailySummary(input: SendDailySummaryInput): Promise<void> {
  return sendDailySummaryFlow(input);
}

const mailjetSend = ai.defineTool(
  {
    name: 'mailjetSend',
    description: 'Sends an email using the Mailjet API.',
    inputSchema: z.object({
      recipientEmail: z.string().email(),
      recipientName: z.string(),
      subject: z.string(),
      htmlContent: z.string(),
    }),
    outputSchema: z.void(),
  },
  async ({recipientEmail, recipientName, subject, htmlContent}) => {
    const mailjetApiKey = process.env.MAILJET_API_KEY;
    const mailjetApiSecret = process.env.MAILJET_API_SECRET; 

    if (!mailjetApiKey || !mailjetApiSecret) {
      console.error("Mailjet API key or secret is not set.");
      // In a real app, you might want to throw an error or handle this differently
      return; 
    }

    const body = {
      Messages: [
        {
          From: {
            Email: 'you@example.com', // Replace with a verified sender email
            Name: 'ZINGER',
          },
          To: [
            {
              Email: recipientEmail,
              Name: recipientName,
            },
          ],
          Subject: subject,
          HTMLPart: htmlContent,
        },
      ],
    };
    
    // In a real app, you would use a library like `node-mailjet`
    // For this example, we will use fetch.
    await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(mailjetApiKey + ":" + mailjetApiSecret)
        },
        body: JSON.stringify(body)
    });
  }
);


const prompt = ai.definePrompt({
    name: 'dailySummaryPrompt',
    input: {schema: SendDailySummaryInputSchema},
    tools: [mailjetSend],
    prompt: `You are an AI assistant for the ZINGER app. Your task is to send a daily summary email to the user with their tasks for the day.

User Name: {{{name}}}
User Email: {{{email}}}
Tasks for today:
{{#each tasks}}
- Topic: {{{this.topic}}}, Tasks: {{{this.tasks}}}
{{/each}}

Generate a friendly and encouraging email subject and body. The body must be in HTML format. Then, use the mailjetSend tool to send the email.
`,
});

const sendDailySummaryFlow = ai.defineFlow(
  {
    name: 'sendDailySummaryFlow',
    inputSchema: SendDailySummaryInputSchema,
  },
  async input => {
    await generate({
        prompt: prompt.prompt,
        input: input,
        tools: [mailjetSend],
        model: 'googleai/gemini-2.5-flash',
    });
  }
);
