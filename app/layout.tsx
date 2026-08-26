import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReclaimID MX",
  description: "Turn scattered fraud evidence into a clear recovery case.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
