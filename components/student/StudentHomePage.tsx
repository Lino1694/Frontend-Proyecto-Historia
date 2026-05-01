import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { Lesson } from '../../types';
import { TrophyIcon } from '../icons/TrophyIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useXP } from '../../hooks/useXP';
import { useTheme } from '../../contexts/ThemeContext';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import  PreIncaCultures  from './PreIncaCultures';
import ViceroyaltyPeriod from './ViceroyaltyPeriod';
import IndependencePeriod from './IndependencePeriod';
import BatallaAngamos from './BatallaAngamos';
import IncaCulture from './IncaCulture';
import CaralCity from './CaralCity';
import ProgressTimeline from './ProgressTimeline';
import LessonView from './LessonView';
import apiService from '../../services/api';

interface StudentHomePageProps {
    userName: string;
    onLogout: () => void;
    navigateToActivity: () => void;
}

const mockClasses = [
    {
        id: 'caral-ciudad',
        title: 'Caral - La Primera Ciudad',
        description: 'Es el origen de la civilización en el Perú y América, perteneciente al periodo precerámico.',
        icon: '🏛️',
        color: 'bg-stone-300',
        year: '3000 - 1800 a.C.'
    },
    {
        id: 'pre-inca',
        title: 'Culturas Pre-Incaicas',
        description: 'Este es un periodo muy amplio que abarca todas las civilizaciones que surgieron después de Caral y antes del apogeo inca.',
        icon: '🏺',
        color: 'bg-yellow-200',
        year: '1500 a.C. - 1400 d.C.'
    },
    {
        id: 'cultura-inca',
        title: 'La Cultura Inca',
        description: 'Representa el último y más grande imperio que se desarrolló en el Perú antes de la llegada de los españoles.',
        icon: '🏛️',
        color: 'bg-amber-300',
        year: '1400 - 1532 d.C.'
    },
    {
        id: 'virreinato',
        title: 'El Virreinato del Perú',
        description: 'Se inicia con la conquista española del Imperio Inca y se consolida como la entidad política que gobernó la región durante casi 300 años.',
        icon: '📜',
        color: 'bg-blue-200',
        year: '1542 - 1824'
    },
    {
        id: 'independencia',
        title: 'La Independencia',
        description: 'Este proceso culmina con la declaración de la independencia del Perú, marcando el fin del Virreinato.',
        icon: '🕊️',
        color: 'bg-red-200',
        year: 'Proclamada en 1821'
    },
    {
        id: 'batalla-angamos',
        title: 'La Batalla de Angamos',
        description: 'Un evento clave dentro de la Guerra del Pacífico (1879-1884), que ocurrió varias décadas después de consolidada la independencia.',
        icon: '⚓',
        color: 'bg-blue-300',
        year: '8 de octubre de 1879'
    },
];

const mockRanking = [
    { name: 'Luis A.', xp: 928 },
    { name: 'María P.', xp: 820 },
    { name: 'Sofia R.', xp: 780 },
];

const StudentHomePage: React.FC<StudentHomePageProps> = ({ userName, onLogout }) => {
    const { user } = useAuth();
    const { perfilXP } = useXP(user?.id || null);
    const { themeClasses } = useTheme();
    const { progress, resetAll } = useClassProgress(); // <-- usamos resetAll
    const [currentView, setCurrentView] = useState<string>('main');
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [loadingLessons, setLoadingLessons] = useState(true);

    // Evitar ejecutar más de una vez
    const initializedRef = useRef(false);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const data = await apiService.obtenerLecciones();
                setLessons(data);
            } catch (error) {
                console.error('Error fetching lessons:', error);
            } finally {
                setLoadingLessons(false);
            }
        };
        fetchLessons();
    }, []);

    useEffect(() => {
        // Esperar hasta que perfilXP esté disponible
        if (!perfilXP) return;
        if (initializedRef.current) return;

        const totalXP = perfilXP?.xp?.total ?? 0;
        // Si es usuario nuevo (XP total 0) reiniciar progreso global a 0
        if (totalXP <= 0) {
            resetAll();
        }

        initializedRef.current = true;
    }, [perfilXP, resetAll]);

    const handleClassClick = (classId: string) => {
        setSelectedClass(classId);
        setCurrentView('class');
    };

    const handleBackToMain = () => {
        setCurrentView('main');
        setSelectedClass(null);
        setSelectedLesson(null);
    };

    const handleLessonClick = (lesson: any) => {
        setSelectedLesson(lesson);
        setCurrentView('lesson');
    };

    if (currentView === 'lesson' && selectedLesson) {
        return <LessonView lesson={selectedLesson} onBack={handleBackToMain} />;
    }

    if (currentView === 'class' && selectedClass) {
        return (
            <div className={`${themeClasses.bg} min-h-screen`}>
                <header className={`${themeClasses.headerBg} backdrop-blur-lg p-4 flex justify-between items-center shadow-sm sticky top-0 z-10`}>
                    <button
                        onClick={handleBackToMain}
                        className="text-brand-red-orange hover:text-brand-red-orange/80 transition-colors"
                    >
                        ← Volver
                    </button>
                    <h1 className={`text-xl font-bold ${themeClasses.headerText}`}>
                        {mockClasses.find(c => c.id === selectedClass)?.title}
                    </h1>
                </header>
                <div className="p-4">
                    {selectedClass === 'pre-inca' && <PreIncaCultures />}
                    {selectedClass === 'virreinato' && <ViceroyaltyPeriod />}
                    {selectedClass === 'independencia' && <IndependencePeriod />}
                    {selectedClass === 'batalla-angamos' && <BatallaAngamos />}
                    {selectedClass === 'cultura-inca' && <IncaCulture />}
                    {selectedClass === 'caral-ciudad' && <CaralCity />}
                </div>
            </div>
        );
    }

    return (
        <div className={themeClasses.bg}>
            <header className={`${themeClasses.headerBg} backdrop-blur-lg p-4 flex justify-between items-center shadow-sm sticky top-0 z-10`}>
                <div>
                    <h1 className={`text-xl font-bold ${themeClasses.headerText}`}>¡Hola, {userName}!</h1>
                    <p className={`${themeClasses.secondaryText} text-sm`}>¡Sigue con tu aventura!</p>
                </div>
                <button onClick={onLogout} className="bg-brand-red-orange/20 text-brand-red-orange font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-red-orange/30 text-sm transition-colors">
                    Salir
                </button>
            </header>

            <div className="p-4 space-y-6 lg:flex lg:flex-row lg:gap-8 lg:space-y-0">
                <div className="lg:flex-1">
                    <h2 className={`text-xl font-bold ${themeClasses.cardText} mb-3`}>Conocimiento</h2>
                    <div className="space-y-4">
                        {mockClasses.map((clase) => (
                            <div key={clase.id} className="cursor-pointer" onClick={() => handleClassClick(clase.id)}>
                                <Card
                                    className={`hover:shadow-lg transition-shadow hover:-translate-y-1 ${themeClasses.cardBg}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl ${clase.color}`}>
                                            {clase.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-bold ${themeClasses.cardText}`}>{clase.title}</h3>
                                            <p className={`${themeClasses.secondaryText} text-sm`}>{clase.description}</p>
                                            <div className="mt-2">
                                                {progress[clase.id] >= 100 ? (
                                                    <div className="flex items-center gap-2">
                                                        <ProgressBar progress={100} />
                                                        <span className="text-sm font-bold text-green-600">Completado ✓</span>
                                                    </div>
                                                ) : (
                                                    <ProgressBar progress={progress[clase.id] ?? 0} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {lessons.length > 0 && (
                        <>
                            <h2 className={`text-xl font-bold ${themeClasses.cardText} mb-3 mt-8`}>Lecciones Personalizadas</h2>
                            <div className="space-y-4">
                                {lessons.map((lesson) => (
                                    <div key={lesson.id} className="cursor-pointer" onClick={() => handleLessonClick(lesson)}>
                                        <Card className={`hover:shadow-lg transition-shadow hover:-translate-y-1 ${themeClasses.cardBg}`}>
                                            <div className="flex items-center gap-4">
                                                {lesson.imagen_url ? (
                                                    <img src={lesson.imagen_url} alt={lesson.titulo} className="w-14 h-14 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-lg bg-brand-orange flex items-center justify-center text-2xl">
                                                        📚
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className={`text-lg font-bold ${themeClasses.cardText}`}>{lesson.titulo}</h3>
                                                    <p className={`${themeClasses.secondaryText} text-sm`}>{lesson.descripcion}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="space-y-6 lg:w-80">
                    <Card className={themeClasses.cardBg}>
                        <h3 className={`text-lg font-bold mb-3 flex items-center ${themeClasses.cardText}`}><TrophyIcon className="h-5 w-5 mr-2 text-brand-light-orange" /> Tu Avatar</h3>
                        <div className="flex items-center">
                            <img src={user?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop"} alt="Avatar" className="w-14 h-14 rounded-full border-4 border-brand-yellow bg-brand-cream object-cover" />
                            <div className="ml-4">
                                <p className={`font-bold ${themeClasses.cardText}`}>{userName}</p>
                                {perfilXP ? (
                                    <>
                                        <p className={`text-sm ${themeClasses.secondaryText}`}>Nivel {perfilXP.nivel.actual} • {perfilXP.xp.total} XP</p>
                                        <p className={`text-sm ${themeClasses.secondaryText} font-semibold`}>Posición: {perfilXP.posicion_ranking}º</p>
                                    </>
                                ) : (
                                    <>
                                        <p className={`text-sm ${themeClasses.secondaryText}`}>Cargando...</p>
                                        <p className={`text-sm ${themeClasses.secondaryText} font-semibold`}>Posición: --</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    <ProgressTimeline items={mockClasses.map(c => ({ ...c, progress: progress[c.id] ?? 0 }))} onItemClick={handleClassClick} />

                    <Card className={themeClasses.cardBg}>
                        <h3 className={`text-lg font-bold mb-3 flex items-center ${themeClasses.cardText}`}><UsersIcon className="h-5 w-5 mr-2 text-brand-light-orange" /> Ranking de Clase</h3>
                        <ul className="space-y-3">
                            {perfilXP?.ranking ? (
                                perfilXP.ranking.slice(0, 4).map((player) => (
                                    <li key={player.id} className={`flex items-center justify-between text-sm ${themeClasses.cardText}`}>
                                        <div className="flex items-center">
                                            <span className="font-bold w-6">{player.posicion}.</span>
                                            <span>{player.nombre}</span>
                                        </div>
                                        <span className={`font-bold ${themeClasses.secondaryText}`}>{player.xp_total} XP</span>
                                    </li>
                                ))
                            ) : (
                                mockRanking.slice(0, 4).map((player, index) => (
                                    <li key={player.name} className={`flex items-center justify-between text-sm ${themeClasses.cardText}`}>
                                        <div className="flex items-center">
                                            <span className="font-bold w-6">{index + 1}.</span>
                                            <span>{player.name}</span>
                                        </div>
                                        <span className={`font-bold ${themeClasses.secondaryText}`}>{player.xp} XP</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentHomePage;