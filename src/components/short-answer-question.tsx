"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ShortAnswerQuestionProps {
  question: string;
}

export function ShortAnswerQuestion({ question }: ShortAnswerQuestionProps) {
  const [answer, setAnswer] = useState("");
  const onSubmit = (answer: string) => {
    console.log(answer);
  };
  const handleSubmit = () => {
    onSubmit(answer);
    setAnswer("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
      <Card className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-sm shadow-lg border-0 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold ">{question}</CardTitle>
        </CardHeader>
        <CardContent className="text-black">
          <Textarea
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[100px] resize-none border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
