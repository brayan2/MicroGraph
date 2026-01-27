import React from 'react';
import './LoadingScreen.css';

export const LoadingScreen: React.FC<{ isExiting?: boolean }> = ({ isExiting }) => {
    return (
        <div className={`loading-screen ${isExiting ? 'exit' : ''}`}>
            <div className="loading-content">
                <div className="loading-logo">
                    Micro-Store
                </div>
                <div className="loading-bar-container">
                    <div className="loading-bar"></div>
                </div>
                <div className="loading-text">Elevating your shopping experience...</div>
            </div>
        </div>
    );
};
