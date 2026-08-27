import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgencyOS — AI Web Agency",
  description: "AI-assisted lead intelligence for web agencies",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
