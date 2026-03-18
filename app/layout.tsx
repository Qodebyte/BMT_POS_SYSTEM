import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/ui/sonner';
import { InactivityProvider } from './components/InactivityProvider';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: 'Big Men Transaction - Admin Portal',
  description: 'Executive admin dashboard for Big Men Transaction Apparel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans bg-black text-white antialiased`}
      >
        <InactivityProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </InactivityProvider>
        <Toaster />
      </body>
    </html>
  );
}