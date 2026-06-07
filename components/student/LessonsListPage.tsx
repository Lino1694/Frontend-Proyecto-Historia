import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { useTheme } from '../../contexts/ThemeContext';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import { apiService } from '../../services/api';

interface Lesson {
    id: number;
    titulo: string;
    descripcion: string;
    contenido: string;
    imagen_url?: string;
    preguntas?: any[];
    multimedia?: any[];
}

interface LessonsListPageProps {
    temaId: string;
    temaTitle: string;
    onBack: () => void;
    onLessonSelect: (lesson: Lesson) => void;
}

const LessonsListPage: React.FC<LessonsListPageProps> = ({ temaId, temaTitle, onBack, onLessonSelect }) => {
    const { themeClasses } = useTheme();
    const { progress, addProgress } = useClassProgress();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
    }, [temaId]);

    const handleLessonClick = (lesson: Lesson) => {
        onLessonSelect(lesson);
    };

    const filteredLessons = lessons.filter(lesson =>
        lesson.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`${themeClasses.bg} min-h-screen`}>
            <header className={`p-4 ${themeClasses.headerBg} shadow-sm flex items-center sticky top-0 z-10`}>
                <button onClick={onBack} className="text-brand-dark-green hover:text-brand-dark-green/80 transition-colors font-semibold">
                    ← Volver
                </button>
                <h1 className={`text-xl font-bold ${themeClasses.headerText} flex-1 text-center`}>{temaTitle}</h1>
            </header>

            <div className="p-4">
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar lecciones..."
                        className="w-full px-4 py-2 rounded-lg bg-white border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                    />
                </div>

                <div className="mb-6">
                    <h2 className={`text-lg font-bold ${themeClasses.cardText} mb-2`}>Tu Progreso</h2>
                    <ProgressBar progress={progress[temaId] ?? 0} />
                    <p className={`text-sm ${themeClasses.secondaryText} mt-1`}>{progress[temaId] ?? 0}% completado</p>
                </div>

                {loading ? (
                    <Card>
                        <p className={`text-center ${themeClasses.secondaryText}`}>Cargando lecciones...</p>
                    </Card>
                ) : filteredLessons.length === 0 ? (
                    <Card>
                        <p className={`text-center ${themeClasses.secondaryText}`}>No hay lecciones disponibles para este tema</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredLessons.map((lesson) => (
                            <div key={lesson.id} className="cursor-pointer" onClick={() => handleLessonClick(lesson)}>
                                <Card className={`hover:shadow-lg transition-shadow ${themeClasses.cardBg}`}>
                                    <div className="flex items-start gap-4">
                                        {lesson.imagen_url && (
                                            <img
                                                src={lesson.imagen_url}
                                                alt={lesson.titulo}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-bold ${themeClasses.cardText}`}>{lesson.titulo}</h3>
                                            <p className={`${themeClasses.secondaryText} text-sm mt-1`}>{lesson.descripcion}</p>
                                            {lesson.preguntas && lesson.preguntas.length > 0 && (
                                                <p className={`text-xs ${themeClasses.secondaryText} mt-2`}>
                                                    {lesson.preguntas.length} preguntas
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonsListPage;
