import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AuraFi — Personal Finance & Transaction Dashboard",
  description: "A premium, highly interactive dashboard for personal wealth management and real-time transaction syncing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
