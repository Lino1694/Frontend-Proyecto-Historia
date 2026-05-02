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
    categoria?: string;
    xp_recompensa: number;
    participantes: number;
    estado: 'active' | 'completed';
    fecha_fin: string;
    creador_id: number;
    created_at?: string;
}

interface RetosPorCategoria {
    "Avanzando en la Historia": {
        "Caral - La primera Ciudad": Reto[];
        "Cultura Inca": Reto[];
        "La Conquista de Perú": Reto[];
        "El Virreinato en el Perú": Reto[];
        "Independencia del Perú": Reto[];
        "Retos Personalizados": Reto[];
    };
    "Otros": Reto[];
}

interface StudentChallengesPageProps {
    navigateToActivity: (lessonId: number, currentQuestionId: number) => void;
}

const mockMissions: Lesson[] = [
    // Retos mock eliminados según solicitud del usuario
];

const StudentChallengesPage: React.FC<StudentChallengesPageProps> = ({ navigateToActivity }) => {
    const { themeClasses } = useTheme();

    const [retosPorCategoria, setRetosPorCategoria] = useState<RetosPorCategoria | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentRetoId, setCurrentRetoId] = useState<number | null>(null);

    const [missions, setMissions] = useState<Lesson[]>(mockMissions);

    const activeMissions = missions.filter(m => !m.completed);
    const completedMissions = missions.filter(m => m.completed);

    // Obtener todos los retos para estadísticas
    const allRetos = retosPorCategoria ? [
        ...Object.values(retosPorCategoria["Avanzando en la Historia"]).flat(),
        ...retosPorCategoria["Otros"]
    ] : [];

    const activeRetos = allRetos.filter(r => r.estado === 'active');
    const completedRetos = allRetos.filter(r => r.estado === 'completed');

    const fetchRetos = async () => {
        try {
            console.log('=== FETCHING RETOS POR CATEGORÍA ===');
            const data = await apiService.obtenerRetosPorCategoria();
            console.log('Retos por categoría received:', data);
            setRetosPorCategoria(data);
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
              <header className={`p-4 ${themeClasses.headerBg} shadow-sm flex justify-center items-center sticky top-0 z-10`}>
                  <h1 className={`text-xl font-bold text-center ${themeClasses.headerText}`}>Retos</h1>
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

                        {/* Mostrar retos organizados por categorías en orden cronológico */}
                        {retosPorCategoria && (
                            <>
                                {/* Sección Avanzando en la Historia */}
                                <Card className={themeClasses.cardBg}>
                                    <h3 className={`text-lg font-bold ${themeClasses.cardText} mb-4`}>🏛️ Avanzando en la Historia</h3>
                                    {/* Orden cronológico de las categorías históricas */}
                                    {[
                                        'Caral - La primera Ciudad',
                                        'Cultura Inca',
                                        'La Conquista de Perú',
                                        'El Virreinato en el Perú',
                                        'Independencia del Perú'
                                    ].map((subcategoria) => {
                                        const retos = retosPorCategoria["Avanzando en la Historia"][subcategoria];
                                        if (!retos) return null;

                                        const retosActivos = retos.filter(r => r.estado === 'active');
                                        if (retosActivos.length === 0) return null;

                                        return (
                                            <div key={subcategoria} className="mb-6 last:mb-0">
                                                <h4 className={`text-md font-semibold ${themeClasses.cardText} mb-3`}>{subcategoria}</h4>
                                                <div className="space-y-3">
                                                    {retosActivos.map((reto) => (
                                                        <Card key={`reto-${reto.id}`} className={`hover:shadow-lg transition-shadow ${themeClasses.cardBg} border-l-4 border-brand-orange`}>
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${reto.tipo === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                                        {reto.tipo === 'individual' ? 'Individual' : 'Competencia'}
                                                                    </span>
                                                                    <h5 className={`text-lg font-bold mt-2 ${themeClasses.cardText}`}>{reto.titulo}</h5>
                                                                    <p className={`${themeClasses.secondaryText} text-sm`}>{reto.descripcion}</p>
                                                                    <p className={`${themeClasses.secondaryText} text-sm`}>
                                                                        Participantes: {reto.participantes} |
                                                                        Gana hasta <span className="font-bold text-brand-light-orange">{reto.xp_recompensa} XP</span>
                                                                    </p>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <button
                                                                        onClick={() => handleUnirseReto(reto.id)}
                                                                        className="bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-red-orange transition-transform transform hover:scale-105 text-sm"
                                                                    >
                                                                        Comenzar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </Card>

                                {/* Sección Otros retos */}
                                {retosPorCategoria["Otros"].filter(r => r.estado === 'active').length > 0 && (
                                    <Card className={themeClasses.cardBg}>
                                        <h3 className={`text-lg font-bold ${themeClasses.cardText} mb-4`}>Otros Retos</h3>
                                        <div className="space-y-3">
                                            {retosPorCategoria["Otros"].filter(r => r.estado === 'active').map((reto) => (
                                                <Card key={`reto-${reto.id}`} className={`hover:shadow-lg transition-shadow ${themeClasses.cardBg}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${reto.tipo === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                                {reto.tipo === 'individual' ? 'Individual' : 'Competencia'}
                                                            </span>
                                                            <h5 className={`text-lg font-bold mt-2 ${themeClasses.cardText}`}>{reto.titulo}</h5>
                                                            <p className={`${themeClasses.secondaryText} text-sm`}>{reto.descripcion}</p>
                                                            <p className={`${themeClasses.secondaryText} text-sm`}>
                                                                Participantes: {reto.participantes} |
                                                                Gana hasta <span className="font-bold text-brand-light-orange">{reto.xp_recompensa} XP</span>
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <button
                                                                onClick={() => handleUnirseReto(reto.id)}
                                                                className="bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-red-orange transition-transform transform hover:scale-105 text-sm"
                                                            >
                                                                Comenzar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </>
                        )}

                        <Card className={`text-center ${themeClasses.cardBg}`}>
                            <h3 className={`font-bold ${themeClasses.cardText}`}>Retos Completados</h3>
                            {(completedMissions.length + completedRetos.length) > 0 ? (
                                <div>
                                    <p className={`text-sm ${themeClasses.secondaryText}`}>¡Felicitaciones! Has completado <strong>{completedMissions.length + completedRetos.length}</strong> reto(s).</p>
                                    {completedRetos.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {completedRetos.map((reto) => (
                                                <div key={`completed-${reto.id}`} className={`p-3 rounded-lg ${themeClasses.cardBg} border border-green-200`}>
                                                    <h5 className={`font-semibold ${themeClasses.cardText}`}>{reto.titulo}</h5>
                                                    <p className={`text-xs ${themeClasses.secondaryText}`}>Completado • +{reto.xp_recompensa} XP</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
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

