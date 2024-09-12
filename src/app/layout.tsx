import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { PrismaClient } from '@prisma/client';
import  ThemeProvider  from "@/lib/provider/next-theme-provider";
import { twMerge } from "tailwind-merge";
import { Session } from "@/lib/provider/session-provider";
// Initialize the Prisma Client
const prisma = new PrismaClient();



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

  console.log(prisma);
  return (
    <html lang="en">
      <body className={twMerge('bg-background',inter.className)}>
       <Session>
       <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
        </ThemeProvider> 
        </Session></body>
    </html>
  );
}
