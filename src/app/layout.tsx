import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { assistant, inter, loversQuarrel } from '@/lib/fonts';
import { cn } from '@/lib/utils';


export const metadata: Metadata = {
  title: 'zinger',
  description: 'Your personalized AI-powered study partner.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "font-body antialiased",
          inter.variable,
          assistant.variable,
          loversQuarrel.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
         <FirebaseClientProvider>
            <FirebaseErrorListener />
            <SidebarProvider>
                <Sidebar>
                <SidebarNav />
                </Sidebar>
                <SidebarInset>
                <Header />
                {children}
                </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
