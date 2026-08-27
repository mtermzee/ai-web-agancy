import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CompanyStoreProvider } from "@/components/providers/CompanyStoreProvider";

export const metadata: Metadata = {
  title: "AgencyOS — AI Web Agency",
  description: "AI-assisted lead intelligence for web agencies",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <CompanyStoreProvider>
          <div className="app-shell">
            <Sidebar />
            <main className="main">
              <Topbar />
              {children}
            </main>
          </div>
        </CompanyStoreProvider>
      </body>
    </html>
  );
}
