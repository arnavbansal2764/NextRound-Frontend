import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import ProfileModal from "@/components/modals/Profile/User/studentProfileModal";
import LoadingProvider from "@/providers/loadingProvider";
import ToasterProvider from "@/providers/toastProvider";
export const metadata: Metadata = {
  title: "CareerBridge",
  description: "An AI Powered platform which revolutionizes hiring",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans">
          <ToasterProvider />
          <Header />
          <ProfileModal />
          <LoadingProvider>
            {children}
          </LoadingProvider>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
