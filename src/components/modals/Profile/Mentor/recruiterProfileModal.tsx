'use client';
import Modal from "../../modal";
import Heading from "../../ModalInputs/Heading";
import Input from "./Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import useCreateProfile from "@/hooks/useCreateProfile";
import Calendar from "../../ModalInputs/calendar";
import { FaFileCode, FaLandmark } from "react-icons/fa";
import { FaMoneyBillTrendUp, FaUserGroup } from "react-icons/fa6";
import { IoMdBusiness } from "react-icons/io";
import { IoSchool } from "react-icons/io5";
import { FaSchoolFlag } from "react-icons/fa6";
import toast from "react-hot-toast";
import axios from "axios";
import CategoryInput from "../../ModalInputs/categoryInput";
import useMentorProfile from "@/hooks/useMentorProfile";
const organizationItems = [
    {
        label: 'Government',
        icon: FaLandmark
    },
    {
        label: 'Private',
        icon: FaUserGroup
    }
];

interface FormData {
    name: string;
    designation: string;
    about: string;
    qualifications: string;
    experience: string;
    email: string;
    skills: string;
}

enum STEPS {
    NAME = 0,
    DESIGNATION = 1,
    ABOUT = 2,
    QUALIFICATIONS = 3,
    EXPERIENCE = 4,
    EMAIL = 5,
    SKILLS = 6
}

const MentorProfileModal = () => {
    const {
        register,
        handleSubmit,
        formState: {
            errors,
        },
        reset
    } = useForm<FormData>({
        defaultValues: {
            name: "",
            designation: "",
            about: "",
            qualifications: "",
            experience: "",
            email: "",
            skills: ""
        },
    });

    const MentorProfile = useMentorProfile();
    const [step, setStep] = useState(STEPS.NAME);
    const [isLoading, setIsLoading] = useState(false);
    const onBack = () => {
        setStep((value) => value - 1);
    };

    const onNext = () => {
        setStep((value) => value + 1);
    };

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        console.log("Hello");
        if (step !== STEPS.SKILLS) {
            return onNext();
        }

        setIsLoading(true);
        const profileData = {
            name: data.name,
            designation: data.designation,
            about: data.about,
            qualifications: data.qualifications,
            experience: data.experience,
            email: data.email,
            skills: data.skills
        };
        console.log(profileData);
        try {
            const response = await axios.post("/api/mentor/profile",{
                data:{
                    name: data.name,
                    designation: data.designation,
                    about: data.about,
                    qualifications: data.qualifications,
                    experience: data.experience,
                    email: data.email,
                    skills: data.skills
                }
            }).then(()=>{
                toast.success("Profile Created !!");
                MentorProfile.onClose();
            }).catch(()=>{
                toast.error("Something Went Wrong");
            }).finally(()=>{
                setIsLoading(false);
            })
        } catch (error) {
            console.log("Error while creating profile",error);
        }
        setIsLoading(false);
    };

    const actionLabel = useMemo(() => {
        if (step === STEPS.SKILLS) {
            return 'Create';
        }
        return 'Next';
    }, [step]);

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.NAME) {
            return undefined;
        }
        return 'Back';
    }, [step]);

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title="Enter your name"
                subtitle="Enter your name"
            />
            <Input
                id="name"
                label="Your Full Name"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
        </div>
    );

    if (step === STEPS.NAME) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Name"
                    subtitle="Enter your name"
                />
                <Input
                    id="name"
                    label="Your Full Name"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        );
    }

    if (step === STEPS.DESIGNATION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Your Designation"
                    subtitle="Tell us about your designation"
                />
                <Input
                    id="designation"
                    label="Designation"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        );
    }

    if (step === STEPS.ABOUT) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="About you"
                    subtitle="Tell us about you"
                />
                <Input
                    id="about"
                    label="About"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />                
            </div>
        );
    }
    if (step === STEPS.QUALIFICATIONS) {    
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Qualifications"
                    subtitle="Tell us about your qualifications"
                />
                <Input
                    id="qualifications"
                    label="Qualifications"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />         
            </div>
        );
    }
    if (step === STEPS.EXPERIENCE) {    
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Experience"
                    subtitle="Tell us about your experience"
                />
                <Input
                    id="experience"
                    label="Experiences"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />         
            </div>
        );
    }
    if (step === STEPS.EMAIL) {    
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Email"
                    subtitle="Your Email"
                />
                <Input
                    id="email"
                    label="Email"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />      
            </div>
        );
    }
    if (step === STEPS.SKILLS) {    
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Skills"
                    subtitle="Your Skills"
                />
                <Input
                    id="skills"
                    label="Skills"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />  
            </div>
        );
    }



    return (
        <Modal
            isOpen={MentorProfile.isOpen}
            onClose={MentorProfile.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.NAME ? undefined : onBack}
            title="Welcome! Create your profile"
            body={bodyContent}
        />
    );
};

export default MentorProfileModal;
