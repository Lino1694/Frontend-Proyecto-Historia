import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { TrophyIcon } from '../icons/TrophyIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useXP } from '../../hooks/useXP';
import { useTheme } from '../../contexts/ThemeContext';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import { apiService } from '../../services/api';

const allInsignias = [
    { name: 'Explorador', icon: '🗺️', requiredLevel: 2 },
    { name: 'Exacto', icon: '🎯', requiredLevel: 4 },
    { name: 'Cartógrafo', icon: '📜', requiredLevel: 6 },
    { name: 'Cronista', icon: '✒️', requiredLevel: 8 },
    { name: 'Guardián', icon: '🛡️', requiredLevel: 10 },
    { name: 'Viajero', icon: '🧭', requiredLevel: 12 },
];

const mockRanking = [
    { rank: 1, name: 'Luis A.', xp: 928, isUser: false },
    { rank: 2, name: 'María P.', xp: 820, isUser: true },
    { rank: 3, name: 'Sofia R.', xp: 780, isUser: false },
    { rank: 4, name: 'Carlos V.', xp: 750, isUser: false },
];

interface RetosPorCategoria {
    "Avanzando en la Historia": {
        [key: string]: any[];
    };
    "Otros": any[];
}

const StudentAchievementsPage: React.FC = () => {
    const { user } = useAuth();
    const { perfilXP } = useXP(user?.id || null);
    const { themeClasses } = useTheme();
    const { progress } = useClassProgress();
    const [retosCompletadosHistoria, setRetosCompletadosHistoria] = useState(0);

    const currentLevel = perfilXP?.nivel?.actual || 1;
    const unlockedInsignias = allInsignias.filter(insignia => currentLevel >= insignia.requiredLevel);
    const lockedInsignias = allInsignias.filter(insignia => currentLevel < insignia.requiredLevel);

    // Calculate completed lessons (100% progress)
    const classes = [
        { id: 'caral-ciudad' },
        { id: 'pre-inca' },
        { id: 'cultura-inca' },
        { id: 'virreinato' },
        { id: 'independencia' },
        { id: 'batalla-angamos' },
    ];
    const completedLessons = classes.filter(c => progress[c.id] >= 100).length;
    const totalLessons = classes.length;

    // Fetch completed retos in "Avanzando en la Historia"
    useEffect(() => {
        const fetchRetos = async () => {
            try {
                const data: RetosPorCategoria = await apiService.obtenerRetosPorCategoria();
                const retosHistoria = Object.values(data["Avanzando en la Historia"]).flat();
                const completados = retosHistoria.filter((r: any) => r.estado === 'completed').length;
                setRetosCompletadosHistoria(completados);
            } catch (error) {
                console.error('Error fetching retos:', error);
                setRetosCompletadosHistoria(0);
            }
        };
        fetchRetos();
    }, []);

    const completedChallengesWithGoodScore = retosCompletadosHistoria;
    const weeklyGoal = 5; // Weekly target for challenges
    const currentWeekProgress = Math.min(completedChallengesWithGoodScore, weeklyGoal);

    return (
        <div className={`${themeClasses.bg} min-h-full`}>
            <header className={`p-4 ${themeClasses.headerBg} shadow-sm`}>
                <h1 className={`text-xl font-bold text-center ${themeClasses.headerText}`}>Tus Logros</h1>
            </header>
            <div className="p-4 space-y-6">
                <Card className={themeClasses.cardBg}>
                    <div className="text-center">
                        <p className={`font-bold text-lg ${themeClasses.cardText}`}>{perfilXP?.usuario.nombre || 'Usuario'}</p>
                        <p className={`text-sm ${themeClasses.secondaryText}`}>{perfilXP?.xp.total || 0} XP • Nivel {perfilXP?.nivel.actual || 1}</p>
                    </div>
                    <div className="mt-4">
                        <ProgressBar progress={perfilXP?.nivel.progreso || 0} color="bg-brand-yellow" />
                        <p className={`text-xs text-center mt-1 ${themeClasses.secondaryText}`}>Siguiente nivel: {perfilXP?.xp.necesario_para_siguiente || 0} XP</p>
                    </div>
                </Card>

                <Card className={themeClasses.cardBg}>
                    <h3 className={`text-lg font-bold mb-3 ${themeClasses.cardText}`}>Insignias</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {allInsignias.map(insignia => {
                            const isUnlocked = currentLevel >= insignia.requiredLevel;
                            return (
                                <div key={insignia.name} className="flex flex-col items-center">
                                    <div className={`text-4xl p-3 rounded-full transition-all ${
                                        isUnlocked
                                            ? 'bg-brand-yellow-orange shadow-md'
                                            : 'bg-slate-200 opacity-50'
                                    }`}>
                                        {insignia.icon}
                                    </div>
                                    <span className={`text-xs font-semibold mt-1 ${
                                        isUnlocked ? themeClasses.cardText : 'text-slate-400'
                                    }`}>
                                        {insignia.name}
                                    </span>
                                    {!isUnlocked && (
                                        <span className="text-xs text-slate-400 mt-1">
                                            Nivel {insignia.requiredLevel}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 text-center">
                        <p className={`text-sm ${themeClasses.secondaryText}`}>
                            Insignias desbloqueadas: {unlockedInsignias.length} de {allInsignias.length}
                        </p>
                        {lockedInsignias.length > 0 && (
                            <p className={`text-xs ${themeClasses.secondaryText} mt-1`}>
                                Siguiente insignia: Nivel {lockedInsignias[0].requiredLevel}
                            </p>
                        )}
                    </div>
                </Card>
                
                <Card className={themeClasses.cardBg}>
                    <h3 className={`text-lg font-bold mb-3 ${themeClasses.cardText}`}>Rachas y Metas</h3>
                      <div className="flex justify-around">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-brand-orange">📚</p>
                            <p className={`font-semibold ${themeClasses.cardText}`}>Lecciones completadas</p>
                            <p className={`text-sm ${themeClasses.secondaryText}`}>{Math.round((completedLessons / totalLessons) * 100)}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-brand-orange">🎯</p>
                             <p className={`font-semibold ${themeClasses.cardText}`}>Retos completados</p>
                             <p className={`text-sm ${themeClasses.secondaryText}`}>{Math.round((currentWeekProgress / weeklyGoal) * 100)}%</p>
                        </div>
                    </div>
                </Card>

                <Card className={themeClasses.cardBg}>
                    <h3 className={`text-lg font-bold mb-3 ${themeClasses.cardText}`}>Ranking de Clase</h3>
                    <ul className="space-y-2">
                        {perfilXP?.ranking ? (
                            perfilXP.ranking.slice(0, 4).map((player) => (
                                <li key={player.id} className={`flex items-center justify-between p-2 rounded-lg text-sm ${themeClasses.cardText} ${player.id === user?.id ? 'bg-brand-yellow-orange' : ''}`}>
                                    <div className="flex items-center">
                                        <span className="font-bold w-6">{player.posicion}.</span>
                                        <span>{player.nombre}</span>
                                    </div>
                                    <span className={`font-bold ${themeClasses.secondaryText}`}>{player.xp_total} XP</span>
                                </li>
                            ))
                        ) : (
                            mockRanking.map(player => (
                                <li key={player.name} className={`flex items-center justify-between p-2 rounded-lg text-sm ${themeClasses.cardText} ${player.isUser ? 'bg-brand-yellow-orange' : ''}`}>
                                    <div className="flex items-center">
                                        <span className="font-bold w-6">{player.rank}.</span>
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
    );
};

export default StudentAchievementsPage;
