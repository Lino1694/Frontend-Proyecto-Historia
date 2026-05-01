import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 1 9 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 16.5c-1.437-1.25-3.375-2-5.375-2s-3.938.75-5.375 2m10.75 0c1.438-1.25 2.625-2.812 2.625-4.5 0-1.688-1.188-3.188-2.625-4.5M5.625 16.5c-1.438-1.25-2.625-2.812-2.625-4.5 0-1.688 1.188-3.188 2.625-4.5m1.875 9V18.75M16.5 13.5V18.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3Z" />
    </svg>
);
