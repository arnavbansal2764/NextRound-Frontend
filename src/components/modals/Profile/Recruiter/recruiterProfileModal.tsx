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
import useRecruiterProfile from "@/hooks/useRecruiterProfile";
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
    companyName: string;
    aboutCompany: string;
    organization: string;
    gstin : string;
}

enum STEPS {
    NAME = 0,
    COMPANYNAME = 1,
    ABOUT = 2,
    GSTIN = 3,
    ORGANIZATION = 4,
}

const RecruiterProfileModal = () => {
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
            companyName: "",
            aboutCompany: "",
            organization: "",
            gstin: "",
        },
    });

    const recruiterProfile = useRecruiterProfile();
    const [step, setStep] = useState(STEPS.NAME);
    const [isLoading, setIsLoading] = useState(false);
    const [organization, setOrganization] = useState("");
    const onBack = () => {
        setStep((value) => value - 1);
    };

    const onNext = () => {
        setStep((value) => value + 1);
    };

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        console.log("Hello");
        if (step !== STEPS.ORGANIZATION) {
            return onNext();
        }

        setIsLoading(true);
        const profileData = {
            name: data.name,
            companyName: data.companyName,
            aboutCompany: data.aboutCompany,
            organization: organization,
            gstin: data.gstin
        };
        console.log(profileData);
        try {
            const response = await axios.post("/api/recruiter/profile",{
                data:{
                    name: data.name,
                    companyName: data.companyName,
                    aboutCompany: data.aboutCompany,
                    organization: organization
                }
            }).then(()=>{
                toast.success("Profile Created !!");
                recruiterProfile.onClose();
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
        if (step === STEPS.ORGANIZATION) {
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

    if (step === STEPS.COMPANYNAME) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Company Name"
                    subtitle="Enter your company name"
                />
                <Input
                    id="companyName"
                    label="Your Company Name"
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
                    title="About Company"
                    subtitle="Tell us about your company"
                />
                <Input
                    id="aboutCompany"
                    label="Company Name"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        );
    }
    if (step === STEPS.GSTIN) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Enter your GST Number"
                    subtitle="Enter company's GST Number"
                />
                <Input
                    id="gstin"
                    label="GST Number"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        );
    }

    if (step === STEPS.ORGANIZATION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Tell us what type of organization you're part of"
                    subtitle="Enter category of organization"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                    {organizationItems.map((item) => (
                        <div key={item.label} className="col-span-1">
                            <CategoryInput
                                onClick={() => setOrganization(item.label)}
                                selected={organization === item.label}
                                label={item.label}
                                icon={item.icon}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }



    return (
        <Modal
            isOpen={recruiterProfile.isOpen}
            onClose={recruiterProfile.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.NAME ? undefined : onBack}
            title="Welcome! Create your profile"
            body={bodyContent}
        />
    );
};

export default RecruiterProfileModal;
