import { config } from 'dotenv';
config();

import '@/ai/flows/curate-external-study-resources.ts';
import '@/ai/flows/generate-personalized-study-schedule.ts';
import '@/ai/flows/display-daily-motivational-quotes.ts';
import '@/ai/flows/provide-personalized-study-tips.ts';
import '@/ai/flows/get-notes-for-topic.ts';
import '@/ai/flows/chat.ts';
import '@/ai/flows/send-daily-summary.ts';
