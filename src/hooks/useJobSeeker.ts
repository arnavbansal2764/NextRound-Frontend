import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import {create} from 'zustand';

interface JobSeeker{
    isJobSeeker : boolean;
    onOpen : ()=>void;
    onClose : ()=> void;
}

const useJobSeeker = create<JobSeeker>((set)=>({
    isJobSeeker : false,
    onOpen : ()=>set({isJobSeeker: true}),
    onClose : ()=>set({isJobSeeker:false})
}));

export default useJobSeeker;