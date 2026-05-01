import React from 'react';
import { Card } from '../shared/Card';
import { useTheme } from '../../contexts/ThemeContext';

interface TimelineItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    progress: number;
    year?: string;
}

interface ProgressTimelineProps {
    items: TimelineItem[];
    onItemClick: (id: string) => void;
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ items, onItemClick }) => {
    const { themeClasses } = useTheme();

    return (
        <Card className={`p-6 ${themeClasses.cardBg}`}>
            <h3 className={`text-lg font-bold mb-4 ${themeClasses.cardText}`}>Línea de Tiempo de Progreso</h3>
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-brand-yellow"></div>

                <div className="space-y-6">
                    {items.map((item, index) => (
                        <div key={item.id} className="relative flex items-start">
                            {/* Timeline dot */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-4 border-white shadow-lg ${item.color} cursor-pointer hover:scale-110 transition-transform`}
                                 onClick={() => onItemClick(item.id)}>
                                {item.icon}
                            </div>

                            {/* Content */}
                            <div className="ml-6 flex-1">
                                <div className={`${themeClasses.cardBg} rounded-lg p-4 shadow-sm ${themeClasses.border} cursor-pointer hover:shadow-md transition-shadow`}
                                     onClick={() => onItemClick(item.id)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-bold ${themeClasses.cardText}`}>{item.title}</h4>
                                        {item.year && <span className={`text-sm ${themeClasses.secondaryText}`}>{item.year}</span>}
                                    </div>
                                    <p className={`${themeClasses.secondaryText} text-sm mb-3`}>{item.description}</p>

                                    {/* Progress bar */}
                                    <div className={`w-full ${themeClasses.border} rounded-full h-2`}>
                                        <div
                                            className="bg-brand-light-orange h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${item.progress}%` }}
                                        ></div>
                                    </div>
                                    <p className={`text-xs ${themeClasses.secondaryText} mt-1`}>{item.progress}% completado</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default ProgressTimeline;