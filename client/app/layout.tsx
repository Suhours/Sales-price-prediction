import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sales Price Predictor",
  description: "Predict sales price using LR or RF models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-black/10 bg-white">
          <div className="mx-auto max-w-5xl p-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Sales Price Predictor</div>
            <form action="/api/logout" method="post">
              <button className="rounded-md text-xs px-3 py-1.5 border border-black/10 hover:bg-black/5">Logout</button>
            </form>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
