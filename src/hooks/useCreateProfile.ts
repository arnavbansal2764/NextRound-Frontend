import {create} from 'zustand';

interface CreateProfile{
    isOpen : boolean;
    onOpen : ()=>void;
    onClose : ()=> void;
}

const useCreateProfile = create<CreateProfile>((set)=>({
    isOpen : false,
    onOpen : ()=>set({isOpen: true}),
    onClose : ()=>set({isOpen:false}),

}));

export default useCreateProfile;