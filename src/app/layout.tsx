import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import LoadingProvider from "@/providers/loadingProvider";
import ToasterProvider from "@/providers/toastProvider";
import SessionWrapper from "@/components/auth/SessionWrapper";
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
    <SessionWrapper>
      <html lang="en">
        <body className="font-sans">
          <ToasterProvider />
          <LoadingProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow relative">{children}</main>
              <Footer />
            </div>
          </LoadingProvider>
        </body>
      </html>
    </SessionWrapper>

  );
}
