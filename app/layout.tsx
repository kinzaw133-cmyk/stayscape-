import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Splash from "@/components/Splash";
import Chatbot from "@/components/Chatbot";
import { AuthProvider } from "@/lib/auth-context";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-display" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "StayScape | Stay • Explore • Discover",
  description: "Discover and compare hotels and resorts with StayScape.",
};

// Applies the saved theme before first paint so there is no flash.
const themeScript = `try{var t=localStorage.getItem("stayscape-theme");if(t)document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="forest" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-fg antialiased">
        <AuthProvider>
          <Splash />
          <Navbar />
          <main>{children}</main>
          <footer className="mt-10 border-t border-fg/10 px-6 py-12 text-sm text-muted">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-2xl text-fg">StayScape</p>
                <p>Stay • Explore • Discover</p>
              </div>
              <p>© {new Date().getFullYear()} StayScape. Portfolio project with test data.</p>
            </div>
          </footer>
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}