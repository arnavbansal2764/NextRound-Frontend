'use client';
import Modal from "../modal";
import Heading from "../ModalInputs/Heading";
import React, { useState, useMemo } from "react";
import CategoryInput from "../ModalInputs/categoryInput"

import { PiStudentBold } from "react-icons/pi";
import { IoPersonAddSharp } from "react-icons/io5";
import useEnterRole from "@/hooks/useEnterRole";
import useCreateProfile from "@/hooks/useCreateProfile";
import useRecruiterProfile from "@/hooks/useRecruiterProfile";
import useRecruiter from "@/hooks/useRecruiter";
import useMentor from "@/hooks/useMentor";
import useMentorProfile from "@/hooks/useMentorProfile";
import { IoMdPersonAdd } from "react-icons/io";
import useJobSeeker from "@/hooks/useJobSeeker";
const EnterRole = () => {

    const enterRole = useEnterRole();
    const recruiter = useRecruiter();
    const mentor = useMentor();
    const mentorProfile = useMentorProfile();
    const jobSeeker = useJobSeeker();
    const createProfile = useCreateProfile();
    const recruiterProfile = useRecruiterProfile();
    const [role, setRole] = useState("");

    const onSubmit = () => {
        if (role === "Job Seeker") {
            //open recruiter login form
            enterRole.onClose();
            createProfile.onOpen();
            jobSeeker.onOpen();
            recruiter.onClose();
            mentor.onClose();
        }
        if(role==="Recruiter") {
            enterRole.onClose();
            recruiterProfile.onOpen();
            recruiter.onOpen();
            mentor.onClose();
            jobSeeker.onClose();

        }
        if(role==="Mentor") {
            enterRole.onClose();
            mentorProfile.onOpen();
            mentor.onOpen();
            jobSeeker.onClose();
            recruiter.onClose();
        }
    }
    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title="Describe your role"
                subtitle="Are you a job seeker or a recruiter"
            />
            <CategoryInput
                onClick={() => setRole("Job Seeker")}
                selected={role === "Job Seeker"}
                label={"Job Seeker"}
                icon={PiStudentBold}
            />
            <CategoryInput
                onClick={() => setRole("Recruiter")}
                selected={role === "Recruiter"}
                label={"Recruiter"}
                icon={IoPersonAddSharp}
            />
            <CategoryInput
                onClick={() => setRole("Mentor")}
                selected={role === "Mentor"}
                label={"Mentor"}
                icon={IoMdPersonAdd}
            />

        </div>
    );
    return (
        <Modal
            isOpen={enterRole.isOpen}
            onClose={enterRole.onClose}
            onSubmit={onSubmit}
            actionLabel="Next"
            title="Enter your role"
            body={bodyContent}
        />
    );
};

export default EnterRole;
