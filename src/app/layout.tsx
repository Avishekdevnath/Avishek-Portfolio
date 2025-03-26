// /src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Avishek - Portfolio",
  description: "Software Engineer Portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}