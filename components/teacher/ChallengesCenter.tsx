import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { EyeIcon } from '../icons/EyeIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { apiService } from '../../services/api';

interface Challenge {
    id: number;
    title: string;
    description: string;
    type: 'individual' | 'competition';
    xpReward: number;
    participants: number;
    status: 'active' | 'completed';
    endDate: string;
    categoria?: string;
    maxIntentos?: number;
}

interface ReportData {
    id: number;
    titulo: string;
    promedio_puntuacion: number;
    tasa_completitud: number;
    total_estudiantes: number;
    estudiantes: {
        nombre: string;
        avatar_url: string;
        puntuacion: number;
        estado: 'completado' | 'en_progreso' | 'no_iniciado';
    }[];
    preguntas_dificiles: {
        pregunta: string;
        tasa_error: number;
    }[];
}

const ChallengesCenter: React.FC<{onBack: () => void; onEditChallenge?: (challenge: Challenge) => void}> = ({ onBack, onEditChallenge }) => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [challengeReport, setChallengeReport] = useState<ReportData | null>(null);
    const [loadingReport, setLoadingReport] = useState(false);

    const fetchChallengeReport = async (challengeId: number) => {
        setLoadingReport(true);
        try {
            const data = await apiService.obtenerDetalleReto(challengeId);
            setChallengeReport({
                id: data.reto.id,
                titulo: data.reto.titulo,
                promedio_puntuacion: data.estadisticas.promedio_general,
                tasa_completitud: data.estadisticas.tasa_completitud,
                total_estudiantes: data.estudiantes.length,
                estudiantes: data.estudiantes.map(e => ({
                    nombre: e.nombre,
                    avatar_url: e.avatar_url,
                    puntuacion: e.puntuacion,
                    estado: e.fecha_completado ? 'completado' : 'no_iniciado'
                })),
                preguntas_dificiles: data.analisis_preguntas.map(p => ({
                    pregunta: p.pregunta_texto,
                    tasa_error: 1 - (p.tasa_aciertos || 0)
                }))
            });
        } catch (error) {
            console.error('Error fetching challenge report:', error);
        } finally {
            setLoadingReport(false);
        }
    };

    const handleViewReport = (challenge: Challenge) => {
        setSelectedChallenge(challenge);
        fetchChallengeReport(challenge.id);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const filteredChallenges = challenges.filter(challenge => 
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (challenge.description && challenge.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (challenge.categoria && challenge.categoria.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    useEffect(() => {
        const fetchRetos = async () => {
            try {
                const data = await apiService.obtenerRetosActivos();
                const formattedChallenges = data.map(r => ({
                    id: r.id,
                    title: r.titulo,
                    description: r.descripcion,
                    type: r.tipo,
                    xpReward: r.xp_recompensa,
                    participants: r.participantes,
                    status: r.estado,
                    endDate: r.fecha_fin,
                    categoria: r.categoria,
                    maxIntentos: r.max_intentos
                }));
                setChallenges(formattedChallenges);
            } catch (error) {
                console.error('Error fetching retos:', error);
            }
        };
        fetchRetos();
    }, []);

    return (
        <div className="flex-1 overflow-y-auto bg-brand-cream">
            <header className="p-4 bg-white shadow-sm flex items-center sticky top-0 z-10">
                <button onClick={onBack} className="font-bold text-2xl text-slate-600">{'<'}</button>
                <h1 className="text-xl font-bold text-center text-slate-800 flex-1">Centro de Retos y Competencias</h1>
            </header>

            <div className="p-4 space-y-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar retos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white border-2 border-slate-300 focus:border-brand-light-orange focus:outline-none pl-10"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                </div>

                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-700">Retos Activos</h2>
                    <button
                        onClick={() => {
                            if (onEditChallenge) {
                                const emptyChallenge: Challenge = {
                                    id: 0,
                                    title: '',
                                    description: '',
                                    type: 'individual',
                                    xpReward: 100,
                                    participants: 0,
                                    status: 'active',
                                    endDate: new Date().toISOString().split('T')[0]
                                };
                                onEditChallenge(emptyChallenge);
                            }
                        }}
                        className="bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark-green transition-colors"
                    >
                        + Nuevo Reto
                    </button>
                </div>

                <div className="space-y-4">
                    {filteredChallenges.map((challenge) => (
                        <Card key={challenge.id}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            challenge.type === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            {challenge.type === 'individual' ? 'Individual' : 'Competencia'}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            challenge.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {challenge.status === 'active' ? 'Activo' : 'Completado'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">{challenge.title}</h3>
                                    <p className="text-slate-600 text-sm mb-2">{challenge.description}</p>
                                    <div className="flex gap-4 text-sm text-slate-500">
                                        <span>👥 {challenge.participants} participantes</span>
                                        <span>⭐ {challenge.xpReward} XP</span>
                                        <span>📅 Hasta {new Date(challenge.endDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleViewReport(challenge)}
                                        className="bg-brand-yellow-orange text-slate-800 font-bold py-1 px-3 rounded-lg hover:bg-brand-light-orange transition-colors text-sm flex items-center gap-1"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        Reporte
                                    </button>
                                    <button 
                                        onClick={() => onEditChallenge && onEditChallenge(challenge)}
                                        className="bg-brand-yellow-orange text-slate-800 font-bold py-1 px-3 rounded-lg hover:bg-brand-light-orange transition-colors text-sm flex items-center gap-1"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (confirm('¿Estás seguro de eliminar este reto?')) {
                                                apiService.eliminarReto(challenge.id)
                                                    .then(() => {
                                                        setChallenges(challenges.filter(c => c.id !== challenge.id));
                                                    })
                                                    .catch(err => alert('Error al eliminar: ' + err));
                                            }
                                        }}
                                        className="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {filteredChallenges.length === 0 && searchQuery === '' && (
                    <Card>
                        <div className="text-center py-8">
                            <p className="text-slate-600">No hay retos activos</p>
                            <p className="text-sm text-slate-500 mt-2">Crea tu primer reto para motivar a los estudiantes</p>
                        </div>
                    </Card>
                )}

                {filteredChallenges.length === 0 && searchQuery !== '' && (
                    <Card>
                        <div className="text-center py-8">
                            <p className="text-slate-600">No se encontraron retos</p>
                            <p className="text-sm text-slate-500 mt-2">Intenta con otro término de búsqueda</p>
                        </div>
                    </Card>
                )}

                {selectedChallenge && challengeReport && (
                    <div className="absolute inset-0 bg-black/50 flex items-end justify-center z-20 backdrop-blur-sm" onClick={() => { setSelectedChallenge(null); setChallengeReport(null); }}>
                        <div className="bg-brand-cream rounded-t-2xl pt-4 shadow-xl w-full max-w-sm h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <div className="px-4 pb-2">
                                <div className="text-center w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3"></div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Reporte: {selectedChallenge.title}</h2>
                                        <p className="text-sm text-slate-600">Análisis de rendimiento detallado.</p>
                                    </div>
                                    <button onClick={() => { setSelectedChallenge(null); setChallengeReport(null); }} className="font-bold text-2xl text-slate-500">&times;</button>
                                </div>
                            </div>

                            <div className="overflow-y-auto px-4 space-y-4 flex-1 pb-4">
                                <Card>
                                    <h3 className="font-bold text-slate-700 mb-2">Desempeño Individual</h3>
                                    {loadingReport ? (
                                        <p className="text-center text-slate-600">Cargando reporte...</p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {challengeReport.estudiantes.map((student, index) => (
                                                <li key={index} className="flex items-center justify-between p-2 rounded-lg bg-brand-cream/70 text-sm">
                                                    <div className="flex items-center">
                                                        <img src={student.avatar_url} alt={student.nombre} className="w-8 h-8 rounded-full mr-2 object-cover" />
                                                        <span className="font-semibold">{student.nombre}</span>
                                                        {student.puntuacion < 70 && student.estado === 'completado' && <span className="ml-2 text-xs font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Apoyo</span>}
                                                    </div>
                                                    <span className={`font-bold ${getScoreColor(student.puntuacion)}`}>{student.estado === 'completado' ? `${student.puntuacion} XP` : '-'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </Card>

                                {challengeReport.preguntas_dificiles.length > 0 && (
                                    <Card>
                                        <h3 className="font-bold text-slate-700 mb-2">Preguntas con Mayor Dificultad</h3>
                                        <ul className="space-y-2 text-sm text-slate-600">
                                            {challengeReport.preguntas_dificiles.slice(0, 5).map((pregunta, i) => (
                                                <li key={i} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                                    <span className="flex-1">{pregunta.pregunta}</span>
                                                    <span className="text-red-600 font-bold ml-2">{Math.round(pregunta.tasa_error * 100)}% error</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}

                                <Card>
                                    <h3 className="font-bold text-slate-700 mb-2">Estadísticas del Reto</h3>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="font-bold text-2xl text-brand-green">{Math.round(challengeReport.promedio_puntuacion)}</p>
                                            <p className="text-xs text-slate-500">Promedio XP</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-2xl text-brand-green">{Math.round(challengeReport.tasa_completitud)}%</p>
                                            <p className="text-xs text-slate-500">Completado</p>
                                        </div>
                                    </div>
                                    <ProgressBar progress={challengeReport.tasa_completitud} color="bg-brand-green" />
                                </Card>
                            </div>

                            <div className="p-4 bg-white border-t border-brand-yellow-orange">
                                <button
                                    onClick={() => { setSelectedChallenge(null); setChallengeReport(null); }}
                                    className="w-full bg-brand-green text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-dark-green transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>Volver a Retos</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallengesCenter;