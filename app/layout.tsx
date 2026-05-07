import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Habit Quest - Gamify Your Life",
  description: "A gamified habit tracking app inspired by Habitica. Turn your life into an RPG!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="habit-quest-theme"
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
