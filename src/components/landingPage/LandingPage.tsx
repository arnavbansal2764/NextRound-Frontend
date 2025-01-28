import ColdApproach from "./coldapproach";
import Features from "./features";
import Hero from "./hero";
import InterviewUICollage from "./interview-ui";
import ResumeEnhancer from "./resumeEnhancer";
import Roadmap from "./roadmap";
import Testimonials from "./testimonials";


export default function Home() {
  return (
    <main className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Hero />
      <InterviewUICollage />
      <Roadmap />
      <Features />
      <ResumeEnhancer />
      <ColdApproach />
      <Testimonials />
    </main>
  )
}

