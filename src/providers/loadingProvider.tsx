'use client';
import Loader from '@/components/loader/loader';
import useLoading from '@/hooks/useLoading';
import React, { ReactNode } from 'react';

interface LoadingProviderProps {
    children: ReactNode;
}

const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const { isOpen } = useLoading(); 

    return (
        <>
            {isOpen && <Loader />}
            {children} 
        </>
    );
};

export default LoadingProvider;
