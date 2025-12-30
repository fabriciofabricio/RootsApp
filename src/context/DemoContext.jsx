import { createContext, useContext, useState, useEffect } from 'react';

const DemoContext = createContext();

export const useDemo = () => {
    return useContext(DemoContext);
};

export const DemoProvider = ({ children }) => {
    const [isDemoMode, setIsDemoMode] = useState(() => {
        const saved = localStorage.getItem('isDemoMode');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('isDemoMode', isDemoMode);
    }, [isDemoMode]);

    const toggleDemoMode = () => {
        setIsDemoMode(prev => !prev);
    };

    const value = {
        isDemoMode,
        toggleDemoMode
    };

    return (
        <DemoContext.Provider value={value}>
            {children}
        </DemoContext.Provider>
    );
};
