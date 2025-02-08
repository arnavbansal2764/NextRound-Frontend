"use client";

import PracticeInterview from "@/components/practice/practice-interview";

export default function PracticeInterviewPage({
  params,
}: {
  params: { language: string };
}) {
  return (
    <PracticeInterview
      websocketUrl={
        "wss://ws1.nextround.tech/ws/practice-interview"
      }
      path={params.language}
    />
  );
}
