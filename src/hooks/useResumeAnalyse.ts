import {create} from 'zustand';

interface ResumeAnalyse{
    isOpen : boolean;
    onOpen : ()=>void;
    onClose : ()=> void;
}

const useResumeAnalyse = create<ResumeAnalyse>((set)=>({
    isOpen : false,
    onOpen : ()=>set({isOpen: true}),
    onClose : ()=>set({isOpen:false}),

}));

export default useResumeAnalyse;