import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import ColdApproach from "@/components/landingpage/coldapproach";
import CTASection from "@/components/landingpage/cta-section";
import ExamCategories from "@/components/landingpage/examcategories";
import Features from "@/components/landingpage/features";
import Hero from "@/components/landingpage/hero";
import InterviewSimulation from "@/components/landingpage/interview-simulation";
import InterviewUICollage from "@/components/landingpage/interview-ui";
import ResumeEnhancer from "@/components/landingpage/resumeEnhancer";
import Roadmap from "@/components/landingpage/roadmap";
import Stats from "@/components/landingpage/stats";
import Testimonials from "@/components/landingpage/testimonials";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Stats />
      <ExamCategories />
      <InterviewSimulation/>
      <Features />
      <InterviewUICollage />
      <Roadmap />
      <ResumeEnhancer />
      <ColdApproach />
      <Testimonials />
      <CTASection />
      
    </main>
  )
}

