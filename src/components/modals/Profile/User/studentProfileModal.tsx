"use client";
import Modal from "../../modal";

import { motion } from 'framer-motion';
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import React, { useState, useMemo, useRef } from "react";
import useCreateProfile from "@/hooks/useCreateProfile";
import toast from "react-hot-toast";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Trophy } from 'lucide-react';
import { UploadDropzone } from "@/lib/uploadThing/uploadThing";
import useUserData from "@/hooks/useUserData";
interface FormData {
  resume: string;
  level: string;
}

enum STEPS {
  RESUME = 0,
  LEVEL=1,
}
const levels = [
        { text: 'Entry-Level', icon: GraduationCap },
        { text: 'Intermediate', icon: Briefcase },
        { text: 'Senior Positions', icon: Trophy },
    ];
const ProfileModal = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      resume: "",
      level:""
    },
  });

  const createProfile = useCreateProfile();
  const [step, setStep] = useState(STEPS.RESUME);
  const [isLoading, setIsLoading] = useState(false);
  const [resume, setResume] = useState("");
  const uploadToastId = useRef<string | number | undefined>(undefined);
  const [fileName, setFileName] = useState<string>("");
  const[level, setLevel] = useState("");
  const { resumeUrl, setResumeUrl, userLevel, setUserLevel } = useUserData();
  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.LEVEL) {
      return onNext();
    }

    setIsLoading(true);
    const profileData = {
      resume: resume,
      level: data.level,
    };
    console.log(profileData);
    const sendApi = async () =>{
      try {
        setResumeUrl(resume);
        setUserLevel(level);
        // console.log("Resume is ", resume);
        console.log("Resume URL is ", useUserData.getState().resumeUrl); 
        // console.log("Level is ", level);
        console.log("User Level is ", useUserData.getState().userLevel);
        createProfile.onClose();
      } catch (error) {
        console.error("Error submitting data:", error);
      }
    }
    toast.promise(sendApi(), {
      loading: "Creating Profile...",
      success: "Profile Created !!",
      error: "Something went wrong!!",
    });
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.LEVEL) {
      return "Create";
    }
    return "Next";
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.RESUME) {
      return undefined;
    }
    return "Back";
  }, [step]);

  let bodyContent = (
    <div className="flex flex-auto gap-8 justify-center">
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-white p-8 rounded-lg max-w-md w-full"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-6 text-center text-gray-800"
        >
          What level of position are you targeting?
        </motion.h2>
        <div className="space-y-4">
          {levels.map((levelItem, index) => (
            <motion.div
              key={levelItem.text}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              {levelItem.text===level? (
                <Button
                  onClick={() => {setLevel(levelItem.text)}}
                  className="w-full py-3 text-lg text-gray-800 flex items-center justify-center border-2 border-red-800"
                  variant="outline"
                >
                  <levelItem.icon className="mr-2 h-5 w-5" />
                  {levelItem.text} 
                </Button>
              ) : (<Button
                onClick={() => setLevel(levelItem.text)}
                className="w-full py-3 text-lg text-gray-800 flex items-center justify-center"
                variant="outline"
              >
                <levelItem.icon className="mr-2 h-5 w-5" />
                {levelItem.text}
              </Button>)}
              
            </motion.div>

          ))}
        </div>
      </motion.div>
    </div>
  );
  if (step === STEPS.RESUME) {
    bodyContent = (
      <div className="p-5 rounded-lg text-black bg-gray-800 ">
        
        <div className=" flex flex-col items-center text-white border-collapse ">
          <UploadDropzone
            className="border-gray-800"
            endpoint="resume"
            onClientUploadComplete={(res: any) => {
              setResume(res[0].url);
              setFileName(res[0].name);
              if (uploadToastId.current !== undefined) {
                toast.success("Resume uploaded successfully!", { id: uploadToastId.current as string });
                uploadToastId.current = undefined;
              }
              console.log(res)
              
            }}
            onUploadBegin={() => {
              uploadToastId.current = toast.loading("Resume uploading...");
            }}
            onUploadError={(error: Error) => {
              if (uploadToastId.current !== undefined) {
                toast.error(`Error uploading file: ${error.message}`, { id: uploadToastId.current as string });
                uploadToastId.current = undefined;
              }
            }}
          />
          {errors.resume && <span className="text-red-500">{errors.resume.message}</span>}
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={createProfile.isOpen}
      onClose={createProfile.onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.RESUME ? undefined : onBack}
      title="Welcome! Create your profile"
      body={bodyContent}
    />
  );
};

export default ProfileModal;
