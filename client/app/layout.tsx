import './globals.css';
import { AuthProvider } from '../lib/auth';
import Navbar from '../components/Navbar';
import MainShell from '../components/MainShell';
import { fontDisplay, fontSans, fontAccent } from './fonts';

export const metadata = {
  title: 'Dear Desserts | Love At First Bite',
  description:
    'Artisanal Belgian waffles, decadent cakes, gourmet thickshakes & signature combos — crafted fresh at Dear Desserts flagship outlet.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontAccent.variable}`}
    >
      <body className="min-h-screen bg-cream-100 font-sans text-cocoa-900 flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <MainShell>{children}</MainShell>
        </AuthProvider>
      </body>
    </html>
  );
}
