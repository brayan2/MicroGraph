import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSegments, Segment } from './hygraphClient';

type PersonalizationContextType = {
    segments: Segment[];
    selectedSegment: Segment | null;
    setSelectedSegment: (segment: Segment | null) => void;
    loading: boolean;
};

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSegments = async () => {
            try {
                const data = await fetchSegments();
                setSegments(data);
                // Default to no segment or first segment for demo
            } catch (err) {
                console.error('Failed to fetch segments', err);
            } finally {
                setLoading(false);
            }
        };
        loadSegments();
    }, []);

    return (
        <PersonalizationContext.Provider value={{ segments, selectedSegment, setSelectedSegment, loading }}>
            {children}
        </PersonalizationContext.Provider>
    );
};

export const usePersonalization = () => {
    const context = useContext(PersonalizationContext);
    if (!context) {
        throw new Error('usePersonalization must be used within a PersonalizationProvider');
    }
    return context;
};
