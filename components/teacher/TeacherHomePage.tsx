import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { StudentProgress } from '../../types';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { TrophyIcon } from '../icons/TrophyIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { apiService } from '../../services/api';

const ToolButton: React.FC<{Icon: React.ElementType, label: string, onClick: () => void, className?: string}> = ({ Icon, label, onClick, className = '' }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 bg-brand-green/20 rounded-lg hover:bg-brand-green/30 transition-colors space-y-1 ${className}`}>
        <Icon className="h-6 w-6 text-brand-green" />
        <span>{label}</span>
    </button>
);

const QuickActionButton: React.FC<{icon: string, label: string, onClick: () => void}> = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200"
    >
        <span className="text-2xl">{icon}</span>
        <span className="font-semibold">{label}</span>
    </button>
);

interface TeacherHomePageProps {
    userName: string;
    onLogout: () => void;
    navigateToRewardsCenter: () => void;
    navigateToReports: () => void;
    navigateToClassManagement: () => void;
    navigateToContentManagement: () => void;
    navigateToChallenges: () => void;
    navigateToCreateChallenge: () => void;
    navigateToCreateLesson: () => void;
}

const TeacherHomePage: React.FC<TeacherHomePageProps> = ({ 
    userName, 
    onLogout, 
    navigateToRewardsCenter, 
    navigateToReports, 
    navigateToClassManagement, 
    navigateToContentManagement, 
    navigateToChallenges,
    navigateToCreateChallenge,
    navigateToCreateLesson
}) => {
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentsProgress = async () => {
            try {
                const data = await apiService.obtenerProgresoEstudiantes();
                const mappedStudents: StudentProgress[] = data.map(student => ({
                    id: student.id,
                    name: student.nombre,
                    avatarUrl: student.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
                    progress: Math.round(student.progreso_general)
                }));
                setStudents(mappedStudents);
            } catch (error) {
                console.error('Error fetching students progress:', error);
                setStudents([
                    { id: 1, name: 'Diego Pérez', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop', progress: 72 },
                    { id: 2, name: 'Maria López', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop', progress: 89 },
                    { id: 3, name: 'Jorge Rios', avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=256&auto=format&fit=crop', progress: 54 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentsProgress();
    }, []);

    return (
        <div className="flex-1 overflow-y-auto bg-brand-cream">
            <header className="bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">¡Hola, {userName}!</h1>
                    <p className="text-slate-600 text-sm">Panel del docente - 5to "A"</p>
                </div>
                 <button onClick={onLogout} className="bg-brand-dark-green/20 text-brand-dark-green font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-dark-green/30 text-sm transition-colors">
                    Salir
                </button>
            </header>

            <main className="p-4 space-y-6">
                <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center"><PlusCircleIcon className="h-5 w-5 mr-2" /> Acceso rápido</h2>
                    <div className="space-y-3">
                        <QuickActionButton 
                            icon="🏆" 
                            label="Crear nuevo reto" 
                            onClick={navigateToCreateChallenge}
                        />
                        <QuickActionButton 
                            icon="📚" 
                            label="Crear nueva lección" 
                            onClick={navigateToCreateLesson}
                        />
                    </div>
                </Card>
                
                <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Progreso de Estudiantes</h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
                            <span className="ml-2 text-slate-600">Cargando estudiantes...</span>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {students.map(student => (
                                <li key={student.id}>
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