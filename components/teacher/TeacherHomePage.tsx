import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { StudentProgress, PendingActivity } from '../../types';
import { PencilIcon } from '../icons/PencilIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { TrophyIcon } from '../icons/TrophyIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { apiService } from '../../services/api';


interface TeacherHomePageProps {
    userName: string;
    onLogout: () => void;
    navigateToRewardsCenter: () => void;
    navigateToReports: () => void;
    navigateToClassManagement: () => void;
    navigateToContentManagement: () => void;
    navigateToChallenges: () => void;
}

const mockActivities: PendingActivity[] = [
    { id: 1, title: 'Culturas Preincas', type: 'Cuestionario', submissions: 12, dueDate: 'Vence hoy', priority: true },
    { id: 2, title: 'Mapa de Lima Colonial', type: 'Mapa', submissions: 8, dueDate: '2 días', priority: false },
];

const ToolButton: React.FC<{Icon: React.ElementType, label: string, onClick: () => void, className?: string}> = ({ Icon, label, onClick, className = '' }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 bg-brand-orange/20 rounded-lg hover:bg-brand-orange/30 transition-colors space-y-1 ${className}`}>
        <Icon className="h-6 w-6 text-brand-orange" />
        <span>{label}</span>
    </button>
);

const TeacherHomePage: React.FC<TeacherHomePageProps> = ({ userName, onLogout, navigateToRewardsCenter, navigateToReports, navigateToClassManagement, navigateToContentManagement, navigateToChallenges }) => {
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentsProgress = async () => {
            try {
                const data = await apiService.obtenerProgresoEstudiantes();
                // Map API response to StudentProgress format
                const mappedStudents: StudentProgress[] = data.map(student => ({
                    name: student.nombre,
                    avatarUrl: student.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
                    progress: Math.round(student.progreso_general)
                }));
                setStudents(mappedStudents);
            } catch (error) {
                console.error('Error fetching students progress:', error);
                // Fallback to mock data if API fails
                setStudents([
                    { name: 'Diego Pérez', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop', progress: 72 },
                    { name: 'Maria López', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop', progress: 89 },
                    { name: 'Jorge Rios', avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=256&auto=format&fit=crop', progress: 54 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentsProgress();
    }, []);

    return (
        <div className="flex-1 overflow-y-auto bg-brand-cream">
            <header className="bg-brand-offwhite/80 backdrop-blur-lg p-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">¡Hola, {userName}!</h1>
                    <p className="text-slate-600 text-sm">Panel del docente - 5to "A"</p>
                </div>
                 <button onClick={onLogout} className="bg-brand-red-orange/20 text-brand-red-orange font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-red-orange/30 text-sm transition-colors">
                    Salir
                </button>
            </header>

            <main className="p-4 space-y-6">
                 <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center"><PencilIcon className="h-5 w-5 mr-2" /> Actividades Pendientes</h2>
                    <div className="space-y-3">
                        {mockActivities.map(activity => (
                            <div key={activity.id} className="bg-brand-cream/60 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-sm">{activity.type}: {activity.title}</h3>
                                    <p className="text-xs text-slate-600">{activity.submissions} entregas • <span className={activity.priority ? 'text-red-500 font-semibold' : ''}>{activity.dueDate}</span></p>
                                </div>
                                <button className={`font-semibold py-1.5 px-3 rounded-lg transition-colors text-sm ${activity.priority ? 'bg-brand-red-orange text-white hover:bg-brand-orange' : 'bg-brand-yellow-orange text-slate-800 hover:bg-brand-light-orange'}`}>
                                    Revisar
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
                
                <Card>
                      <h2 className="text-lg font-bold text-slate-700 mb-3">Progreso de Estudiantes</h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
                            <span className="ml-2 text-slate-600">Cargando estudiantes...</span>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {students.map(student => (
                                <li key={student.name}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center">
                                            <img src={student.avatarUrl} alt={student.name} className="w-8 h-8 rounded-full mr-3 bg-brand-cream object-cover"/>
                                            <span className="font-semibold text-slate-800 text-sm">{student.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600">{student.progress}%</span>
                                    </div>
                                    <div className="w-full bg-brand-cream rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${student.progress}%` }}></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card className="lg:hidden">
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Herramientas</h2>
                      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 text-center text-sm font-semibold text-slate-800">
                          <ToolButton Icon={DocumentTextIcon} label="Contenido" onClick={navigateToContentManagement} />
                          <ToolButton Icon={ChartBarIcon} label="Reportes" onClick={navigateToReports} />
                          <ToolButton Icon={UsersIcon} label="Clase" onClick={navigateToClassManagement} />
                          <ToolButton Icon={TrophyIcon} label="Retos" onClick={navigateToChallenges} />
                          <ToolButton Icon={SparklesIcon} label="Insignias" onClick={navigateToRewardsCenter} />
                      </div>
                </Card>
            </main>
        </div>
    );
};

export default TeacherHomePage;
