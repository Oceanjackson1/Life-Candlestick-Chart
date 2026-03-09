import { create } from 'zustand'

export interface UserLifeData {
    gender: 'male' | 'female' | '';
    birthYear: string;
    birthCity: string;
    parentBackground: string;
    universityCity: string;
    universityMajor: string;
    currentCity: string;
    currentOccupation: string;
}

interface LifeStore {
    userData: UserLifeData;
    partnerData: Partial<UserLifeData>;
    setUserData: (data: Partial<UserLifeData>) => void;
    setPartnerData: (data: Partial<UserLifeData>) => void;
    reset: () => void;
}

const initialUserData: UserLifeData = {
    gender: '',
    birthYear: '',
    birthCity: '',
    parentBackground: '',
    universityCity: '',
    universityMajor: '',
    currentCity: '',
    currentOccupation: '',
}

export const useLifeStore = create<LifeStore>((set) => ({
    userData: initialUserData,
    partnerData: {},
    setUserData: (data) => set((state) => ({ userData: { ...state.userData, ...data } })),
    setPartnerData: (data) => set((state) => ({ partnerData: { ...state.partnerData, ...data } })),
    reset: () => set({ userData: initialUserData, partnerData: {} }),
}))
