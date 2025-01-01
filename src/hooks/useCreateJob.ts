import {create} from 'zustand';

interface CreateJob{
    isOpen : boolean;
    onOpen : ()=>void;
    onClose : ()=> void;
}

const useCreateJob = create<CreateJob>((set)=>({
    isOpen : false,
    onOpen : ()=>set({isOpen: true}),
    onClose : ()=>set({isOpen:false}),

}));

export default useCreateJob;