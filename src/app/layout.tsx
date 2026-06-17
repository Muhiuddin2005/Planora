import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import SmoothScrollProvider from "@/providers/SmoothScrollProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Planora | Secure Event Management",
  description: "Discover and manage events securely.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <SmoothScrollProvider>
            {children}
            <Toaster position="top-center" />
          </SmoothScrollProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

