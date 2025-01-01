"use client";

import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import React, { useState, useMemo } from "react";
import { FaFileCode } from "react-icons/fa";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { IoMdBusiness } from "react-icons/io";
import { IoSchool } from "react-icons/io5";
import { FaSchoolFlag } from "react-icons/fa6";
import useResumeBuild from "@/hooks/useResumeBuild";
import Heading from "../ModalInputs/Heading";
import Input from "./Input";
import Modal from "../modal";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import jsPDF from 'jspdf';

const pathItems = [
  {
    label: "Software",
    icon: FaFileCode,
  },
  {
    label: "Marketing",
    icon: FaMoneyBillTrendUp,
  },
  {
    label: "Business",
    icon: IoMdBusiness,
  },
];

const educationItems = [
  {
    label: "Secondary",
    icon: FaSchoolFlag,
  },
  {
    label: "Senior Secondary",
    icon: FaSchoolFlag,
  },
  {
    label: "Bachelors",
    icon: IoSchool,
  },
  {
    label: "Masters",
    icon: IoSchool,
  },
  {
    label: "PhD",
    icon: IoSchool,
  },
];

interface FormData {
  jobDescription : string;
}

const generatePdf = async (resumeData: string): Promise<Blob> => {
  const doc = new jsPDF();
  doc.text(resumeData, 10, 10);
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

const ResumeBuildModal = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      jobDescription:""
    },
  });

  const resumeBuild = useResumeBuild()
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkdownView, setIsMarkdownView] = useState(false);
  const [resume,setResume]=useState("")
  const [resumeHtml, setResumeHtml] = useState("");

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    setIsMarkdownView(true);
    try {
      const res = await axios.post("/api/ai/resume_build", {
        job_description: data.jobDescription,
      });
      setResume(res.data.resume);
      const pdfBlob = await generatePdf(res.data.resume);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error fetching resume:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const actionLabel = useMemo(() => {
    if (isMarkdownView) {
      return "Close";
    }
    
    return "Create";
  }, [isMarkdownView]);

  const secondaryActionLabel = useMemo(() => {
    if (isMarkdownView) {
      return undefined;
    }
    
  }, [isMarkdownView]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading title="Enter your job description" subtitle="Enter job description" />
      <Input
        id="jobDescription"
        label="Job Description"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
    </div>
  );
  if(isMarkdownView){
    bodyContent=
       (
        <div className="max-h-[500px] overflow-auto p-4 bg-gray-100 rounded-md">
          <ReactMarkdown>{resume}</ReactMarkdown>
        </div>
      )
      
    
  }
  return (
    <Modal
      isOpen={resumeBuild.isOpen}
      onClose={resumeBuild.onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      title="Welcome! Create your resume"
      body={bodyContent}
    />
  );
};

export default ResumeBuildModal;
