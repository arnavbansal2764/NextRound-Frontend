"use client";
import { UploadButton } from "@/lib/uploadThing/uploadThing";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import React, { useState, useMemo } from "react";

import Modal from "../modal";
import useResumeAnalyse from "@/hooks/useResumeAnalyse";
import Heading from "../ModalInputs/Heading";
import Button from "../ModalInputs/Button";
import axios from "axios";
import { set } from "date-fns";

interface FormData {
  resume: File | null;
}

interface Section {
  title: string;
  score: string;
  feedback: string;
}

interface ResumeAnalysis {
  overallRating: number;
  sections: Section[];
  strengths: string[];
  weaknesses: string[];
  overallAssessment: string;
}

const ResumeAnalyse = () => {
  const {
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      resume: null,
    },
  });
  const [resumeAnalysis, setResumeAnalysis] = useState<string>("");

  const resumeAnalyse = useResumeAnalyse();
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setStep(2);

    const res = await axios.post("/api/ai/recommendation", {
      job_description: jobDescription,
      resume: resumeUrl,
    });
    setResumeAnalysis(res.data.response);
    console.log(res.data.response);
  };

  const actionLabel = useMemo(() => {
    if (step === 1) return "Analyse";
    else return null;
  }, [step]);

  let bodyContent = (
    <div className="file_upload p-5 border-4 border-dotted border-gray-300 rounded-lg">
      <svg
        className="text-indigo-500 w-16 h-16 mx-auto mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <div className="input_field flex flex-col items-center">
        <label>
          <UploadButton
            endpoint="resume"
            onUploadBegin={() => {
              setIsLoading(true);
            }}
            onClientUploadComplete={(res) => {
              // Do something with the response
              setResumeUrl(res[0].url);
              setResumeName(res[0].name);
              console.log("Files: ", res);
              setIsLoading(false);
            }}
            onUploadError={(error: Error) => {
              // Do something with the error.
              setIsLoading(false);
              alert(`ERROR! ${error.message}`);
            }}
          />
          {!resumeName ? (
            <div>{isLoading ? <div>"Uploading"</div> : <div></div>}</div>
          ) : (
            <div className="text bg-indigo-600 text-white border border-gray-300 rounded font-semibold cursor-pointer p-2 px-4 hover:bg-indigo-500">
              Selected File : <span className="text-white">{resumeName}</span>
            </div>
          )}
        </label>
      </div>
      <div className="mt-4">
        <input
          type="text"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Enter Job Description"
          className="p-2 border-2 border-gray-300 rounded-lg w-full focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
  if (step === 2) {
    bodyContent = (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 overflow-y-auto max-h-[90vh]">
          {resumeAnalysis}
          <Button label="Close" onClick={resumeAnalyse.onClose} />
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={resumeAnalyse.isOpen}
      onClose={resumeAnalyse.onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      title="Welcome! Analyse your resume"
      body={bodyContent}
    />
  );
};

export default ResumeAnalyse;
