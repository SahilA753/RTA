import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { PrismaClient } from '@prisma/client';
import  ThemeProvider  from "@/lib/provider/next-theme-provider";
import { twMerge } from "tailwind-merge";
import { Session } from "@/lib/provider/session-provider";
import { SocketProvider } from "@/lib/provider/socket-provider";

const inter = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kladbase",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={twMerge('bg-background',inter.className)}>
       <Session>
       <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SocketProvider>
        {children}
        </SocketProvider>
        </ThemeProvider> 
        </Session></body>
    </html>
  );
}
