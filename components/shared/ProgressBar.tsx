import React from 'react';

interface ProgressBarProps {
    progress: number;
    color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = 'bg-brand-light-orange' }) => {
    const safeProgress = Math.max(0, Math.min(100, progress));

    return (
        <div className="w-full bg-brand-cream rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${safeProgress}%` }}></div>
        </div>
    );
};
