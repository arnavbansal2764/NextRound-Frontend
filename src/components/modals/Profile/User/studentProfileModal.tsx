"use client";
import Modal from "../../modal";
import Heading from "../../ModalInputs/Heading";
import Input from "./Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import React, { useState, useMemo, useRef } from "react";
import useCreateProfile from "@/hooks/useCreateProfile";
import toast from "react-hot-toast";
import axios from "axios";
import { UploadDropzone } from "@/lib/uploadThing/uploadThing";
interface FormData {
  fullName: string;
  resume: string;
}

enum STEPS {
  NAME = 0,
  RESUME = 1
}

const ProfileModal = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      fullName: "",
      resume: "",
    },
  });

  const createProfile = useCreateProfile();
  const [step, setStep] = useState(STEPS.NAME);
  const [isLoading, setIsLoading] = useState(false);
  const [resume, setResume] = useState("");
  const uploadToastId = useRef<string | number | undefined>(undefined);
  const [fileName, setFileName] = useState<string>("");
  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.RESUME) {
      return onNext();
    }

    setIsLoading(true);
    const profileData = {
      fullName: data.fullName,
      resume: resume,
    };
    console.log(profileData);
    const sendApi = async () =>{
      try {
        const response = await axios
          .post("/api/user/profile", {
            data: {
              name: data.fullName,
              resume: resume
            },
          })
          .then(() => {
            toast.success("Profile Created !!");
            createProfile.onClose();
          })
          .catch(() => {
            toast.error("Something went wrong!!");
          })
          .finally(() => {
            setIsLoading(false);
          });
        console.log("profileData", profileData);
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
    if (step === STEPS.RESUME) {
      return "Create";
    }
    return "Next";
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.NAME) {
      return undefined;
    }
    return "Back";
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading title="Enter your name" subtitle="Enter your name" />
      <Input
        id="fullName"
        label="Your Full Name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
    </div>
  );
  if (step === STEPS.RESUME) {
    bodyContent = (
      <div className="file_upload p-5 border-4 border-dotted border-gray-300 rounded-lg">
        
        <div className="input_field flex flex-col items-center text-black">
          <UploadDropzone
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
          <span className="text-black text-sm">Selected File : {fileName}</span>
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
      secondaryAction={step === STEPS.NAME ? undefined : onBack}
      title="Welcome! Create your profile"
      body={bodyContent}
    />
  );
};

export default ProfileModal;
