"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex w-full flex-col">
              <SidebarTrigger />
              <div className="grow">
                {children}
              </div>
            </main>
          </SidebarProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
