"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Mic, Pause, Play, StopCircle, Upload } from "lucide-react";

export function InterviewSimulatorComponent() {
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (interviewStarted && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewStarted, isPaused]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
  //@ts-ignore
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeUploaded(true);
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setIsListening(false);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const endInterview = () => {
    setInterviewStarted(false);
    setIsListening(false);
    setTimer(0);
    setIsPaused(false);
    setIsInterviewModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-blue-800 mb-8">
        AI Interview Simulator
      </h1>
      <div className="space-x-4">
        <Dialog
          open={isInterviewModalOpen}
          onOpenChange={setIsInterviewModalOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Take Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {interviewStarted
                  ? "Interview in Progress"
                  : "Upload Your Resume"}
              </DialogTitle>
            </DialogHeader>
            {!interviewStarted ? (
              <div className="grid gap-4 py-4">
                {!resumeUploaded ? (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-blue-400" />
                        <p className="mb-2 text-sm text-blue-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-blue-500">
                          PDF or DOCX (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.docx"
                      />
                    </label>
                  </div>
                ) : (
                  <Button
                    onClick={startInterview}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Start Interview
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-blue-800">
                    {formatTime(timer)}
                  </span>
                  <div className="space-x-2">
                    <Button onClick={togglePause} size="icon" variant="outline">
                      {isPaused ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={endInterview}
                      size="icon"
                      variant="outline"
                    >
                      <StopCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-blue-800 mb-2">
                    AI: Tell me about your experience with React.
                  </p>
                  {isListening ? (
                    <p className="text-blue-600">Listening...</p>
                  ) : (
                    <Button
                      onClick={toggleListening}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Mic className="mr-2 h-4 w-4" /> Answer
                    </Button>
                  )}
                </div>
                <Progress value={33} className="w-full" />
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog
          open={isInsightsModalOpen}
          onOpenChange={setIsInsightsModalOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-100"
            >
              Insights
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Interview Insights</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-blue-800">
                  What You Did Right:
                </h3>
                <ul className="list-disc list-inside text-blue-600">
                  <li>Maintained good eye contact</li>
                  <li>Provided specific examples in answers</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">
                  Areas for Improvement:
                </h3>
                <ul className="list-disc list-inside text-blue-600">
                  <li>Speak more slowly and clearly</li>
                  <li>Elaborate more on technical skills</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">
                  Emotional Analysis:
                </h3>
                <p className="text-blue-600">
                  You appeared confident but showed signs of nervousness when
                  discussing your weaknesses.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
