import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'current';

interface ThemeClasses {
    bg: string;
    headerBg: string;
    headerText: string;
    cardBg: string;
    cardText: string;
    secondaryText: string;
    border: string;
}

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    themeClasses: ThemeClasses;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>('current');

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('appTheme') as Theme;
        if (savedTheme && ['light', 'dark', 'current'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('appTheme', newTheme);
    };

    const getThemeClasses = (currentTheme: Theme): ThemeClasses => {
        switch (currentTheme) {
            case 'light':
                return {
                    bg: 'bg-white',
                    headerBg: 'bg-gray-50',
                    headerText: 'text-gray-900',
                    cardBg: 'bg-white',
                    cardText: 'text-gray-900',
                    secondaryText: 'text-gray-600',
                    border: 'border-gray-200'
                };
            case 'dark':
                return {
                    bg: 'bg-gray-900',
                    headerBg: 'bg-gray-800',
                    headerText: 'text-white',
                    cardBg: 'bg-gray-800',
                    cardText: 'text-white',
                    secondaryText: 'text-gray-400',
                    border: 'border-gray-700'
                };
            default:
                return {
                    bg: 'bg-brand-cream',
                    headerBg: 'bg-brand-offwhite',
                    headerText: 'text-slate-800',
                    cardBg: 'bg-white',
                    cardText: 'text-slate-700',
                    secondaryText: 'text-slate-500',
                    border: 'border-gray-200'
                };
        }
    };

    const themeClasses = getThemeClasses(theme);

    const value: ThemeContextType = {
        theme,
        setTheme,
        themeClasses,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};