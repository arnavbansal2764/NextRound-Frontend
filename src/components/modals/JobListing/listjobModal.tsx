'use client';
import Modal from "../modal";
import Heading from "../ModalInputs/Heading";
import Input from "./Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import React, { useState, useMemo } from "react";
import Calendar from "../ModalInputs/calendar";
import CategoryInput from "../ModalInputs/categoryInput"
import toast from "react-hot-toast";
import useCreateJob from "@/hooks/useCreateJob";
import { PiStudentBold } from "react-icons/pi";
import { IoPersonAddSharp } from "react-icons/io5";
import { MdOutlineComputer } from "react-icons/md";
import { FaFileCode, FaSitemap } from "react-icons/fa";
import { GrCloudComputer } from "react-icons/gr";
import axios from "axios";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { IoMdBusiness } from "react-icons/io";
const jobTypes = [
    {
        label: "Internship",
        icon: PiStudentBold
    },
    {
        label: "Full Time",
        icon: IoPersonAddSharp
    }
]
const organizationData = [
    {
        label: "Government",
        icon: PiStudentBold
    },
    {
        label: "Private",
        icon: IoPersonAddSharp
    }
]
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
const modedata = [
    {
        label: "Remote",
        icon: MdOutlineComputer
    },
    {
        label: "On-Site",
        icon: FaSitemap
    },
    {
        label: "Hybrid",
        icon: GrCloudComputer
    },
]
interface listingProps {
    description: string;
    responsibilities: string;
    requirements: string;
    experience: string;
    location: string;
    jobType: string;
    mode: string;
    jobPath: string;
    salary: string;
    title :string;
    organization : string;
}

enum STEPS {
    TITLE = 0,
    DESCRIPTION = 1,
    PATH = 2,
    RESPONSIBILITIES = 3,
    REQUIREMENTS = 4,
    EXPERIENCE = 5,
    SALARY = 6,
    LOCATION = 7,
    JOBTYPE = 8,
    MODE = 9,
    ORGANIZATION = 10
}

const ListJobModal = () => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        },
        reset
    } = useForm<listingProps>({
        defaultValues: {

            description: "",
            salary: "",
            responsibilities: "",
            requirements: "",
            experience: "",
            location: "",
            jobType: "",
            mode: "",
            jobPath: "",
            organization: ""
        },
    });

    const createJob = useCreateJob();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(STEPS.TITLE);
    const [jobType, setJobType] = useState("");
    const [mode, setMode] = useState("");
    const [organization, setOrganization] = useState("");
    const [path, setPath] = useState("");
    const addToPath = (newString: string) => {
        setPath(newString);
    };
    const addToOrganization = (newString: string) => {
        setOrganization(newString);
    };
    const onBack = () => {
        setStep((value) => value - 1);
    };

    const onNext = () => {
        setStep((value) => value + 1);
    };

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        if (step !== STEPS.ORGANIZATION) {
            return onNext();
        }
        setIsLoading(true);

        // Collect all form data, including jobType, mode, and jobPath
        const jobData = {
            title: data.title,
            description: data.description,
            responsibilities: data.responsibilities,
            requirements: data.requirements,
            experience: data.experience,
            location: data.location,
            salary: data.salary,
            jobType: data.jobType || jobType,
            mode: mode,
            jobPath: path,
            organization : organization // Include jobPath
        };
        console.log(jobData);

        // Check for missing fields
        if (
            !jobData.description ||
            !jobData.responsibilities ||
            !jobData.requirements ||
            !jobData.experience ||
            !jobData.location ||
            !jobData.jobType ||
            !jobData.mode ||
            !jobData.jobPath // Ensure jobPath is included in validation
        ) {
            toast.error("Missing fields");
            setIsLoading(false);
            return;
        }
        const handleCreation = async () => {
            try {
                const response = await axios.post("/api/addjob", jobData); // Send jobData with jobPath
                toast.success("New Job Posted !!");
                createJob.onClose();
            } catch (error) {
                toast.error("Something Went Wrong !!");
                console.error("Error while creating job:", error);
            } finally {
                setIsLoading(false);
            }
        }
        toast.promise(handleCreation(),{
            loading : "Creating Job..",
            success: "Job Created Successfully!",
            error: "Failed to submit application.",
        }
        )
    };

    const actionLabel = useMemo(() => {
        if (step === STEPS.ORGANIZATION) {
            return 'Create';
        }
        return 'Next';
    }, [step]);

    const secondaryActionLabel = useMemo(() => {
        if (step === STEPS.TITLE) {
            return undefined;
        }
        return 'Back';
    }, [step]);

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title="Enter Description of job"
                subtitle="Description of job"
            />
            <Input
                id="description"
                label="Description"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
        </div>
    );
    if (step === STEPS.PATH) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Select Job Path"
                    subtitle="The job path for this listing"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                    {pathItems.map((item) => (
                        <div key={item.label} className="col-span-1">
                            <CategoryInput
                                onClick={() => addToPath(item.label)}
                                selected={path === item.label}
                                label={item.label}
                                icon={item.icon}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    if (step === STEPS.ORGANIZATION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Select Organization"
                    subtitle="What's your organization ?"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                    {organizationData.map((item) => (
                        <div key={item.label} className="col-span-1">
                            <CategoryInput
                                onClick={() => addToOrganization(item.label)}
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
    if (step === STEPS.TITLE) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Job Title"
                    subtitle="Enter the title of the job"
                />
                <Input
                    id="title"
                    label="Job Title"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        );
    }
    if (step === STEPS.RESPONSIBILITIES) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Enter responsibilities"
                    subtitle="responsibilities expected"
                />
                <Input
                    id="responsibilities"
                    label="Responsibilities"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        );
    }
    

    if (step === STEPS.REQUIREMENTS) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Enter Requirements"
                    subtitle="Job Requirements"
                />
                <Input
                    id="requirements"
                    label="Requirements"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        );
    }
    if (step === STEPS.SALARY) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Enter Salary"
                    subtitle="Salary"
                />
                <Input
                    id="salary"
                    label="Salary"
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
                    title="Enter Experiences"
                    subtitle="Job Experience"
                />
                <Input
                    id="experience"
                    label="experiences"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        );
    }

    if (step === STEPS.LOCATION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Enter Location"
                    subtitle="Location of job"
                />
                <Input
                    id="location"
                    label="Location"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        );
    }

    if (step === STEPS.JOBTYPE) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Job Type"
                    subtitle="Select Type of Job"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                    {jobTypes.map((item) => (
                        <div key={item.label} className="col-span-1">
                            <CategoryInput
                                onClick={() => setJobType(item.label)}
                                selected={jobType === item.label}
                                label={item.label}
                                icon={item.icon}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (step === STEPS.MODE) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="Enter Mode"
                    subtitle="Mode required"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                    {modedata.map((item) => (
                        <div key={item.label} className="col-span-1">
                            <CategoryInput
                                onClick={() => setMode(item.label)}
                                selected={mode === item.label}
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
            isOpen={createJob.isOpen}
            onClose={createJob.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.TITLE ? undefined : onBack}
            title="Enter details of new job posting"
            body={bodyContent}
        />
    );
};

export default ListJobModal;
