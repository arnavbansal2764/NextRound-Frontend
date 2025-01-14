import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { JSX, SVGProps } from "react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="fixed top-0 left-0 right-0 bg-white h-[64px]"/>
        <section className="bg-gradient-to-br from-primary to-secondary text-primary-foreground py-12 md:py-24 lg:py-32">
          <div className="grid md:grid-cols-2 gap-8 items-center px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Unlock Your Talent Potential 
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl">
                Our comprehensive recruitment platform combines AI-powered
                assessments, resume analysis, and project-based evaluations to
                find the perfect fit for your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full sm:w-auto">Get Started</Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-black"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              <Card className="bg-primary-foreground text-primary p-6 rounded-lg shadow-lg">
                <CardHeader>
                  <CardTitle>Resume Analysis</CardTitle>
                  <CardDescription>
                    Our advanced algorithms scan resumes to identify key skills,
                    experience, and qualifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-6 w-6" />
                    <span>Automated resume screening</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-6 w-6" />
                    <span>Skill and experience matching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-6 w-6" />
                    <span>Personalized candidate insights</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-primary-foreground text-primary p-6 rounded-lg shadow-lg">
                <CardHeader>
                  <CardTitle>AI-Powered Assessments</CardTitle>
                  <CardDescription>
                    Evaluate candidates' skills, personality, and cultural fit
                    through our AI-driven assessment tools.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-6 w-6" />
                    <span>Customizable assessments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-6 w-6" />
                    <span>Predictive analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-6 w-6" />
                    <span>Objective candidate evaluation</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="py-12 px-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <img
                src="/projecteval.png"
                width="600"
                height="800"
                alt="Project-based Evaluations"
                // className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
              />
            </div>
            <div className="order-1 md:order-2 space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-blue-900">
                Project-based Evaluations
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground">
                Assess candidates' real-world skills and problem-solving
                abilities through project-based evaluations.
              </p>
              <ul className="grid gap-4 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-6 w-6 text-primary" />
                  <span>Customizable project scenarios</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-6 w-6 text-primary" />
                  <span>Collaborative assessment tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-6 w-6 text-primary" />
                  <span>Detailed performance insights</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section className=" py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Improve Talent Retention
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground">
                Our platform helps you find candidates who are truly aligned
                with your company's values, culture, and job requirements,
                leading to improved employee satisfaction and retention.
              </p>
              <ul className="grid gap-4 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-6 w-6 text-primary" />
                  <span>Precise candidate-job matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-6 w-6 text-primary" />
                  <span>Increased employee engagement</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-6 w-6 text-primary" />
                  <span>Reduced turnover and hiring costs</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/talent.png"
                width="600"
                height="800"
                alt="Talent Retention"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
              />
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Integrations
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground">
              Seamlessly integrate NextRound with your existing tools and
              workflows.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 rounded-lg shadow-lg bg-card bg-gradient-to-r from-blue-200 to-purple-200">
                <CardHeader>
                  <CardTitle>Applicant Tracking Systems</CardTitle>
                  <CardDescription>
                    Sync candidate data and assessments with your ATS.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 justify-start">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Seamless data integration</span>
                  </div>
                  <div className="flex items-center gap-2 justify-start">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Streamlined hiring workflows</span>
                  </div>
                  <div className="flex items-center gap-2 justify-start">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Improved candidate experience</span>
                  </div>
                  <hr className="my-4 bg-transparent border-transparent" />
                </CardContent>
              </Card>
              <Card className="p-6 rounded-lg shadow-lg bg-card bg-gradient-to-r from-blue-200 to-blue-500">
                <CardHeader>
                  <CardTitle>HRIS Systems</CardTitle>
                  <CardDescription>
                    Integrate NextRound with your HR information systems.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Centralized employee data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Automated data synchronization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Improved HR efficiency</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="p-6 rounded-lg shadow-lg bg-card bg-gradient-to-r from-cyan-200 to-blue-200">
                <CardHeader>
                  <CardTitle>Video Conferencing</CardTitle>
                  <CardDescription>
                    Conduct virtual interviews and assessments seamlessly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Integrated video tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Collaborative assessment features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Improved remote hiring experience</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="bg-card py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Ready to transform your hiring process?
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground">
              Get started with NextRound today and unlock the power of
              AI-driven recruitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button className="w-full sm:w-auto">Get Started</Button>
              <Button variant="outline" className="w-full sm:w-auto">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function BriefcaseIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function CheckIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
