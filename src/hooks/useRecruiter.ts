import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import {create} from 'zustand';

interface Recruiter{
    isRecruiter : boolean;
    onOpen : ()=>void;
    onClose : ()=> void;
}

const useRecruiter = create<Recruiter>((set)=>({
    isRecruiter : false,
    onOpen : ()=>set({isRecruiter: true}),
    onClose : ()=>set({isRecruiter:false})
}));

export default useRecruiter;