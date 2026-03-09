import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { PushNotificationInitializer } from "@/components/PushNotificationInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "uTask Portal",
  description: "Task management portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="manifest" href="/manifest.json" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0f172a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <AuthProvider>
          <PushNotificationInitializer />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
