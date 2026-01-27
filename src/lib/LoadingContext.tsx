import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { LoadingScreen } from '../components/LoadingScreen';

interface LoadingContextType {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    startLoading: () => void;
    stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const location = useLocation();

    const startLoading = () => {
        setIsLoading(true);
        setIsExiting(false);
    };

    const stopLoading = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsExiting(false);
        }, 500); // Match transition duration
    };

    const setManualLoading = (loading: boolean) => {
        if (loading) startLoading();
        else stopLoading();
    };

    // Trigger loading on route change
    useEffect(() => {
        startLoading();

        // Fallback: mostly for pages that don't have async logic
        // or if something hangs.
        const timer = setTimeout(() => {
            stopLoading();
        }, 1200);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading: setManualLoading, startLoading, stopLoading }}>
            {isLoading && <LoadingScreen isExiting={isExiting} />}
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
