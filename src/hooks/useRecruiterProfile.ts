import {create} from 'zustand';

interface RecruiterProfile{
    isOpen : boolean;
    onOpen : ()=>void;
    onClose : ()=> void;
}

const useRecruiterProfile = create<RecruiterProfile>((set)=>({
    isOpen : false,
    onOpen : ()=>set({isOpen: true}),
    onClose : ()=>set({isOpen:false}),

}));

export default useRecruiterProfile;