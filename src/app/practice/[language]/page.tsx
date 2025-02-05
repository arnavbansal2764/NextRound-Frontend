"use client";

import PracticeInterview from "@/components/practice/practice-interview";
import { useSearchParams } from "next/navigation";

export default function PracticeInterviewPage({
  params,
}: {
  params: { language: string };
}) {
  return (
    <PracticeInterview
      websocketUrl={
        process.env.WEBSOCKET_PRACTICE_INTERVIEW || "ws://localhost:8766"
      }
      path={params.language}
    />
  );
}
