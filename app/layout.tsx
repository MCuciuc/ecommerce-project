import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ModalProvider } from "@/providers/modal-provider";
import prismadb from "@/lib/prismadb";
import { ToasterProvider } from "@/providers/toast-provider";
import { RollbarConsoleProvider } from "@/providers/rollbar-console-provider";
import { RollbarBootstrap } from "@/providers/rollbar-bootstrap";
import { ThemeProvider } from "@/providers/theme-provider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admnin Dashboard",
  description: "Admnin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ToasterProvider />
          <ModalProvider />
          <RollbarBootstrap />
          <RollbarConsoleProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
