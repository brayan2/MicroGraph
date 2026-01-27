import React, { createContext, useContext, useState, useEffect } from 'react';

type PreviewContextType = {
    isClickToEditEnabled: boolean;
    toggleClickToEdit: () => void;
};

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isClickToEditEnabled, setIsClickToEditEnabled] = useState(() => {
        const saved = localStorage.getItem('isClickToEditEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('isClickToEditEnabled', JSON.stringify(isClickToEditEnabled));
    }, [isClickToEditEnabled]);

    const toggleClickToEdit = () => {
        setIsClickToEditEnabled((prev: boolean) => !prev);
    };

    return (
        <PreviewContext.Provider value={{ isClickToEditEnabled, toggleClickToEdit }}>
            {children}
        </PreviewContext.Provider>
    );
};

export const usePreviewContext = () => {
    const context = useContext(PreviewContext);
    if (context === undefined) {
        throw new Error('usePreviewContext must be used within a PreviewProvider');
    }
    return context;
};
