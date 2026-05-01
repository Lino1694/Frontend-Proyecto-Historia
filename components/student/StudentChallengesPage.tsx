import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { Lesson } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import RetoActivityView from './RetoActivityView';

interface Reto {
    id: number;
    titulo: string;
    descripcion: string;
    tipo: 'individual' | 'competition';
    xp_recompensa: number;
    participantes: number;
    estado: 'active' | 'completed';
    fecha_fin: string;
    creador_id: number;
}

interface StudentChallengesPageProps {
    navigateToActivity: (lessonId: number, currentQuestionId: number) => void;
}

const mockMissions: Lesson[] = [
    { id: 1, title: 'Línea de tiempo Incanas', topic: 'Historia del Perú', difficulty: 'Intermedio', progress: 50, xp: 60, completed:false,current_question_id:0 },
    { id: 2, title: 'Explora Lima Colonial', topic: 'Virreinato', difficulty: 'Fácil', progress: 20, xp: 48,completed:false,current_question_id:0 },
    { id: 3, title: 'Quiz: Repaso Virreinato', topic: 'Virreinato', difficulty: 'Difícil', progress: 0, xp: 88, completed:false,current_question_id:0 },
    { id: 4, title: 'La rebelión de Túpac Amaru II', topic: 'Independencia', difficulty: 'Intermedio', progress: 0, xp: 75,completed:false,current_question_id:0 },
];

const StudentChallengesPage: React.FC<StudentChallengesPageProps> = ({ navigateToActivity }) => {
    const { themeClasses } = useTheme();

    const [retos, setRetos] = useState<Reto[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentRetoId, setCurrentRetoId] = useState<number | null>(null);

    const [missions, setMissions] = useState<Lesson[]>(mockMissions);

    const activeMissions = missions.filter(m => !m.completed);
    const completedMissions = missions.filter(m => m.completed);

    const activeRetos = retos.filter(r => r.estado === 'active');
    const completedRetos = retos.filter(r => r.estado === 'completed');

    // Debug: mostrar todos los retos
    console.log('All retos:', retos);
    console.log('Active retos:', activeRetos);
    console.log('Completed retos:', completedRetos);

    const fetchRetos = async () => {
        try {
            console.log('=== FETCHING RETOS FROM STUDENT DASHBOARD ===');
            const data = await apiService.obtenerRetosActivos();
            console.log('Retos received:', data);
            setRetos(data);
        } catch (error) {
            console.error('Error fetching retos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRetos();
    }, []);

    const markMissionCompleted = (id: number) => {
        setMissions(prev =>
            prev.map(m => (m.id === id ? { ...m, completed: true, progress: 100 } : m))
        );
    };

    const handleUnirseReto = async (retoId: number) => {
        try {
            await apiService.unirseReto(retoId);
            setCurrentRetoId(retoId);
        } catch (error) {
            console.error('Error uniendo al reto:', error);
            if (error.message && error.message.includes('Ya estás unido')) {
                setCurrentRetoId(retoId);
            } else {
                alert('Error al iniciar el reto.');
            }
        }
    };

    const handleBackFromReto = () => {
        setCurrentRetoId(null);
        fetchRetos(); // Refresh list
    };

    useEffect(() => {
        const handler = (ev: Event) => {
            try {
                const custom = ev as CustomEvent;
                const missionId = custom?.detail?.missionId;
                if (typeof missionId === 'number') {
                    markMissionCompleted(missionId);
                }
            } catch {
                // no-op
            }
        };
        window.addEventListener('missionCompleted', handler as EventListener);
        return () => window.removeEventListener('missionCompleted', handler as EventListener);
    }, []);

    if (currentRetoId) {
        return <RetoActivityView retoId={currentRetoId} onBack={handleBackFromReto} />;
    }

    return (
        <div className={`${themeClasses.bg} min-h-full`}>
              <header className={`p-4 ${themeClasses.headerBg} shadow-sm flex justify-between items-center sticky top-0 z-10`}>
                  <h1 className={`text-xl font-bold text-center ${themeClasses.headerText} flex-1`}>Retos</h1>
                  <div className="flex rounded-lg bg-brand-cream p-1 text-sm">
                      <button className="px-3 py-1 rounded-md font-semibold bg-brand-yellow text-slate-800 shadow">Semana</button>
                      <button className="px-3 py-1 rounded-md font-semibold text-slate-600">Mes</button>
                  </div>
              </header>
            <div className="p-4 space-y-4">
                {loading ? (
                    <Card className={themeClasses.cardBg}>
                        <p className={`text-center ${themeClasses.cardText}`}>Cargando retos...</p>
                    </Card>
                ) : (
                    <>
                        <Card className={themeClasses.cardBg}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className={`font-bold ${themeClasses.cardText}`}>Retos Activos</h2>
                                    <p className={`text-sm ${themeClasses.secondaryText}`}>Completa misiones y gana XP extra</p>
                                </div>
                                <div className="text-right">
                                     <p className="font-bold text-lg text-brand-orange">+{activeMissions.reduce((sum, m) => sum + m.xp, 0) + activeRetos.reduce((sum, r) => sum + r.xp_recompensa, 0)}</p>
                                     <p className={`text-xs ${themeClasses.secondaryText}`}>XP Posible</p>
                                </div>
                            </div>
                        </Card>
                        {activeMissions.map((mission) => (
                            <Card key={mission.id} className={`hover:shadow-lg transition-shadow ${themeClasses.cardBg}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${mission.difficulty === 'Fácil' ? 'bg-green-100 text-green-800' : mission.difficulty === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{mission.difficulty}</span>
                                        <h3 className={`text-lg font-bold mt-2 ${themeClasses.cardText}`}>{mission.title}</h3>
                                        <p className={`${themeClasses.secondaryText} text-sm`}>Gana hasta <span className="font-bold text-brand-light-orange">{mission.xp} XP</span></p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button onClick={()=>navigateToActivity(mission.id, mission.current_question_id || 0)} className="bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-red-orange transition-transform transform hover:scale-105 text-sm">
                                            {mission.progress > 0 ? 'Continuar' : 'Comenzar'}
                                        </button>

                                        <button onClick={() => markMissionCompleted(mission.id)} className="text-xs text-slate-600 underline hover:text-slate-800">
                                            Marcar como completado
                                        </button>
                                    </div>
                                </div>
                                {mission.progress > 0 &&
                                    <div className="mt-4">
                                        <ProgressBar progress={mission.progress} />
                                    </div>
                                }
                            </Card>
                        ))}
                         {/* Mostrar todos los retos para debugging */}
                         {retos.map((reto) => (
                            <Card key={`reto-${reto.id}`} className={`hover:shadow-lg transition-shadow ${themeClasses.cardBg}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${reto.tipo === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{reto.tipo === 'individual' ? 'Individual' : 'Competencia'}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ml-2 ${reto.estado === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{reto.estado}</span>
                                        <h3 className={`text-lg font-bold mt-2 ${themeClasses.cardText}`}>{reto.titulo}</h3>
                                        <p className={`${themeClasses.secondaryText} text-sm`}>{reto.descripcion}</p>
                                        <p className={`${themeClasses.secondaryText} text-sm`}>Participantes: {reto.participantes} | Gana hasta <span className="font-bold text-brand-light-orange">{reto.xp_recompensa} XP</span></p>
                                        <p className={`${themeClasses.secondaryText} text-xs`}>Fecha límite: {reto.fecha_fin} | Estado: {reto.estado}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button onClick={() => handleUnirseReto(reto.id)} className="bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-red-orange transition-transform transform hover:scale-105 text-sm">
                                            Comenzar
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        <Card className={`text-center ${themeClasses.cardBg}`}>
                            <h3 className={`font-bold ${themeClasses.cardText}`}>Retos Completados</h3>
                            {(completedMissions.length + completedRetos.length) > 0 ? (
                                <p className={`text-sm ${themeClasses.secondaryText}`}>¡Felicitaciones! Has completado <strong>{completedMissions.length + completedRetos.length}</strong> reto(s).</p>
                            ) : (
                                <p className={`text-sm ${themeClasses.secondaryText}`}>Aún no hay retos completados</p>
                            )}
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentChallengesPage;

