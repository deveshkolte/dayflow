import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/AuthShell";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dayflow Admin Console",
  description: "Dayflow HR Administration Console — workforce management for administrators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthShell>{children}</AuthShell>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
