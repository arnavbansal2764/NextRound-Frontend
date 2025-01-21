import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { JSX, SVGProps } from "react";
import Hero from "./hero";
import Features from "./features";
import Testimonials from "./testimonials";

export default function LandingPage() {
  return (
    <main>
      <Hero/>
      <Features/>
      <Testimonials/>
    </main>
  );
}
