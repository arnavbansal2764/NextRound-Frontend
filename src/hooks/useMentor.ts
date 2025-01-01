import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import {create} from 'zustand';

interface Mentor{
    isMentor : boolean;
    onOpen : ()=>void;
    onClose : ()=> void;
}

const useMentor = create<Mentor>((set)=>({
    isMentor : false,
    onOpen : ()=>set({isMentor: true}),
    onClose : ()=>set({isMentor:false})
}));

export default useMentor;