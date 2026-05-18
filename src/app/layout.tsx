import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { AuthProvider } from "@/components/providers/auth-provider";
import { CanonicalRouteProvider } from "@/components/providers/canonical-route-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlexoWhats — WhatsApp automation",
  description:
    "Manage devices, campaigns, auto-replies, and chatbots for WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CanonicalRouteProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </CanonicalRouteProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
