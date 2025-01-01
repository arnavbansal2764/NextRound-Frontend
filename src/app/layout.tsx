import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import ProfileModal from "@/components/modals/Profile/User/studentProfileModal";
import ListJobModal from "@/components/modals/JobListing/listjobModal";
import EnterRole from "@/components/modals/EnterRole/enterRole";
import RecruiterProfileModal from "@/components/modals/Profile/Recruiter/recruiterProfileModal";
import ResumeBuildModal from "@/components/modals/ResumeBuild/resumeBuild";
import ResumeAnalyse from "@/components/modals/ResumeAnalyse/resumeAnalyse";
import LoadingProvider from "@/providers/loadingProvider";
import ToasterProvider from "@/providers/toastProvider";
import MentorProfileModal from "@/components/modals/Profile/Mentor/recruiterProfileModal";
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
          <ListJobModal />
          <EnterRole />
          <RecruiterProfileModal />
          <ResumeBuildModal />
          <ResumeAnalyse />
          <LoadingProvider>
          <MentorProfileModal />
            {children}
          </LoadingProvider>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
