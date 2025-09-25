import { Assistant, Inter, Lovers_Quarrel } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const assistant = Assistant({
  subsets: ['latin'],
  variable: '--font-assistant',
  display: 'swap',
});

export const loversQuarrel = Lovers_Quarrel({
  subsets: ['latin'],
  variable: '--font-lovers-quarrel',
  weight: '400',
  display: 'swap',
});
