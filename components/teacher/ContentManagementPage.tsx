import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { Activity } from '../../types';
import apiService from '../../services/api';

// Mock data, in a real app this would come from an API
const mockActivities: Activity[] = [
    {
        id: 'act_1',
        title: 'Linajes del Perú Colonial',
        type: 'Cuestionario',
        description: '',
        dueDate: '',
        xp: 150,
        maxAttempts: 1,
        questions: [{ id: 'q1', type: 'multiple_choice', questionText: '...', points: 10, options: [], correctOptionId: '' }]
    },
    {
        id: 'act_2',
        title: 'Línea de tiempo Incanas',
        type: 'Línea de Tiempo',
        description: '',
        dueDate: '',
        xp: 120,
        maxAttempts: 1,
        questions: []
    },
    {
        id: 'act_3',
        title: 'La rebelión de Túpac Amaru II',
        type: 'Cuestionario',
        description: '',
        dueDate: '',
        xp: 200,
        maxAttempts: 1,
        questions: []
    },
];

interface ContentManagementPageProps {
    onBack: () => void;
    onCreateNew: () => void;
    onEdit: (activity: Activity) => void;
    onCreateLesson: () => void;
    onEditLesson: (lesson: any) => void;
}

const ContentManagementPage: React.FC<ContentManagementPageProps> = ({ onBack, onCreateNew, onEdit, onCreateLesson, onEditLesson }) => {
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const data = await apiService.obtenerLecciones();
                setLessons(data);
            } catch (error) {
                console.error('Error fetching lessons:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, []);

    return (
        <div className="flex flex-col h-full bg-brand-cream animate-scale-in">
            <header className="p-4 bg-brand-offwhite shadow-sm flex items-center justify-center sticky top-0 z-10 relative">
                 <button onClick={onBack} className="lg:hidden absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors text-base">
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Volver</span>
                </button>
                <h1 className="text-xl font-bold text-center text-slate-800">Gestión de Contenido</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <button
                            onClick={onCreateNew}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-orange/20 text-brand-orange font-bold rounded-lg hover:bg-brand-orange/30 transition-colors">
                            <PlusCircleIcon className="h-6 w-6"/>
                            <span>Crear Nuevo Reto</span>
                        </button>
                    </Card>
                    <Card>
                        <button
                            onClick={onCreateLesson}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-blue/20 text-brand-blue font-bold rounded-lg hover:bg-brand-blue/30 transition-colors">
                            <PlusCircleIcon className="h-6 w-6"/>
                            <span>Crear Nueva Lección</span>
                        </button>
                    </Card>
                </div>

                <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Lecciones Creadas</h2>
                    {loading ? (
                        <p className="text-center text-slate-600">Cargando lecciones...</p>
                    ) : lessons.length > 0 ? (
                        <div className="space-y-3">
                            {lessons.map((lesson) => (
                                <div key={lesson.id} className="bg-brand-cream p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{lesson.titulo}</h3>
                                        <p className="text-sm text-slate-600">{lesson.descripcion}</p>
                                    </div>
                                    <button onClick={() => onEditLesson(lesson)} className="p-2 text-slate-600 hover:text-brand-orange">
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-600">No hay lecciones creadas aún.</p>
                    )}
                </Card>

                <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Retos Existentes</h2>
                    <div className="space-y-3">
                        {mockActivities.map(activity => (
                             <div key={activity.id} className="bg-brand-cream p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-800">{activity.title}</h3>
                                    <p className="text-xs text-slate-600">{activity.type} • {activity.xp} XP</p>
                                </div>
                                <button onClick={() => onEdit(activity)} className="flex items-center gap-2 font-semibold py-1.5 px-3 rounded-lg bg-brand-yellow-orange text-slate-800 hover:bg-brand-light-orange transition-colors text-sm">
                                    <PencilIcon className="h-4 w-4"/>
                                    <span>Editar</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ContentManagementPage;
