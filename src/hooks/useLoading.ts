import { create } from 'zustand';

interface Loading {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useLoading = create<Loading>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),

}));

export default useLoading;