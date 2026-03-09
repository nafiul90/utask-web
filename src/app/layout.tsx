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
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <AuthProvider>
          <PushNotificationInitializer />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
