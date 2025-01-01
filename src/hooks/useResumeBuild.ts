import {create} from 'zustand';

interface ResumeBuild{
    isOpen : boolean;
    onOpen : ()=>void;
    onClose : ()=> void;
}

const useResumeBuild = create<ResumeBuild>((set)=>({
    isOpen : false,
    onOpen : ()=>set({isOpen: true}),
    onClose : ()=>set({isOpen:false}),

}));

export default useResumeBuild;