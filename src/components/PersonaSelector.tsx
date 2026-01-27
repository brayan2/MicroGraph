import React from 'react';
import { usePersonalization } from '../lib/PersonalizationContext';
import '../styles/PersonaSelector.css';

export const PersonaSelector: React.FC = () => {
    const { segments, selectedSegment, setSelectedSegment, loading } = usePersonalization();

    if (loading) return null;

    return (
        <div className="persona-selector">
            <label htmlFor="persona-select">View as:</label>
            <select
                id="persona-select"
                value={selectedSegment?.id || ''}
                onChange={(e) => {
                    const segment = segments.find((s) => s.id === e.target.value);
                    setSelectedSegment(segment || null);
                }}
                className="persona-dropdown"
            >
                <option value="">Default Visitor</option>
                {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                        {segment.name}
                    </option>
                ))}
            </select>
            {selectedSegment && (
                <div className="persona-hint">
                    Simulating: <strong>{selectedSegment.name}</strong>
                </div>
            )}
        </div>
    );
};
