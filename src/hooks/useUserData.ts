import { create } from 'zustand';

interface UserData {
    resumeUrl: string;
    setResumeUrl: (url: string) => void;
    userLevel: string;
    setUserLevel: (level: string) => void;
}

const useUserData = create<UserData>((set) => ({
    resumeUrl: '',
    setResumeUrl: (url) => set((state) => ({ ...state, resumeUrl: url })),
    userLevel: '',
    setUserLevel: (level) => set((state) => ({ ...state, userLevel: level })), // Use userLevel here
}));

export default useUserData;
