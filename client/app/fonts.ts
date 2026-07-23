import { Cormorant_Garamond, Plus_Jakarta_Sans, Syne } from 'next/font/google';

export const fontDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const fontAccent = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-accent',
  display: 'swap',
});
