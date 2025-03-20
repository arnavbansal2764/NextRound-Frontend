import ColdApproach from "@/components/landing/coldapproach";
import CTASection from "@/components/landing/cta-section";
import ExamCategories from "@/components/landing/examcategories";
import Features from "@/components/landing/features";
import Hero from "@/components/landing/hero";
import InterviewSimulation from "@/components/landing/interview-simulation";
import InterviewUICollage from "@/components/landing/interview-ui";
import ResumeEnhancer from "@/components/landing/resumeEnhancer";
import Roadmap from "@/components/landing/roadmap";
import Stats from "@/components/landing/stats";
import Testimonials from "@/components/landing/testimonials";

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

