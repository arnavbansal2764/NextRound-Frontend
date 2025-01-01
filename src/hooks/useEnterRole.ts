import {create} from 'zustand';

interface EnterRole{
    isOpen : boolean;
    onOpen : ()=>void;
    onClose : ()=> void;
}

const useEnterRole = create<EnterRole>((set)=>({
    isOpen : false,
    onOpen : ()=>set({isOpen: true}),
    onClose : ()=>set({isOpen:false}),

}));

export default useEnterRole;