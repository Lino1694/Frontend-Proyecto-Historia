import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-brand-offwhite p-4 rounded-xl shadow-sm ${className}`}>
            {children}
        </div>
    );
};
