import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import TRPCProvider from "./_trpc/TRPCProvide";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Review and Rating",
  description: "Review and Rating",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <TRPCProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen`}
        >
          <header>
            <TopNav />
          </header>
          {children}
          <footer>
            <Footer />
          </footer>
        </body>
      </TRPCProvider>
    </html>
  );
}
