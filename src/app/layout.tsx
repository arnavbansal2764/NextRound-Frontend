import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import LoadingProvider from "@/providers/loadingProvider";
import ToasterProvider from "@/providers/toastProvider";
export const metadata: Metadata = {
  title: "NextRound",
  description: "An AI Powered platform which revolutionizes hiring",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ToasterProvider />
        <Header />
        <LoadingProvider>
          {children}
        </LoadingProvider>
        <Footer />
      </body>
    </html>

  );
}
