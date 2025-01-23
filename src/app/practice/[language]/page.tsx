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
        process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8766"
      }
      path={params.language}
    />
  );
}
