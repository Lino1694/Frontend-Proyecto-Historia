import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { apiService } from '../../services/api';

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

interface DetailedReport {
    leccion: {
        id: number;
        titulo: string;
        descripcion: string;
    };
    estadisticas: {
        promedio_general: number;
        tasa_completitud: number;
        tiempo_promedio: number;
        distribucion_puntuaciones: {
            excelente: number;
            bueno: number;
            regular: number;
            deficiente: number;
        };
    };
    estudiantes: Array<{
        id: number;
        nombre: string;
        avatar_url: string;
        puntuacion: number;
        tiempo_completado: number;
        fecha_completado: string;
        respuestas: Array<{
            pregunta_id: number;
            correcta: boolean;
            tiempo_respuesta: number;
        }>;
    }>;
    analisis_preguntas: Array<{
        pregunta_id: number;
        pregunta_texto: string;
        dificultad: 'facil' | 'medio' | 'dificil';
        tasa_aciertos: number;
        tiempo_promedio: number;
        estudiantes_errores: number[];
    }>;
}

const ReportsPage: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
    const [detailedReport, setDetailedReport] = useState<DetailedReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await apiService.obtenerReportesLecciones();
                setReports(data);
            } catch (error) {
                console.error('Error fetching reports:', error);
                // Fallback to mock data when backend is not implemented
                console.log('Usando datos de demostración hasta que se implemente el backend de reportes');
                setReports([
                    {
                        id: 1,
                        titulo: 'Culturas Preincas',
                        promedio_puntuacion: 82,
                        tasa_completitud: 92,
                        total_estudiantes: 4,
                        estudiantes: [
                            { nombre: 'Diego Pérez', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop', puntuacion: 90, estado: 'completado' },
                            { nombre: 'Maria López', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop', puntuacion: 95, estado: 'completado' },
                            { nombre: 'Jorge Rios', avatar_url: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=256&auto=format&fit=crop', puntuacion: 65, estado: 'completado' },
                            { nombre: 'Valeria Rojas', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop', puntuacion: 0, estado: 'no_iniciado' },
                        ],
                        preguntas_dificiles: [
                            { pregunta: 'Diferencia entre cerámica Moche y Nazca', tasa_error: 0.75 },
                            { pregunta: 'Ubicación de la cultura Chavín', tasa_error: 0.60 },
                            { pregunta: 'Función de los quipus', tasa_error: 0.55 }
                        ],
                    },
                    {
                        id: 2,
                        titulo: 'El Virreinato del Perú',
                        promedio_puntuacion: 76,
                        tasa_completitud: 85,
                        total_estudiantes: 3,
                        estudiantes: [
                            { nombre: 'Diego Pérez', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop', puntuacion: 80, estado: 'completado' },
                            { nombre: 'Maria López', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop', puntuacion: 88, estado: 'completado' },
                            { nombre: 'Jorge Rios', avatar_url: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=256&auto=format&fit=crop', puntuacion: 60, estado: 'completado' },
                        ],
                        preguntas_dificiles: [
                            { pregunta: 'Rol del Corregidor', tasa_error: 0.70 },
                            { pregunta: 'La mita minera y sus consecuencias', tasa_error: 0.65 },
                        ],
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleViewDetail = async (report: ReportData) => {
        setLoadingDetail(true);
        try {
            const detail = await apiService.obtenerDetalleLeccion(report.id);
            setDetailedReport(detail);
        } catch (error) {
            console.error('Error fetching report detail:', error);
        } finally {
            setLoadingDetail(false);
        }
        setSelectedReport(report);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStatusText = (estado: string) => {
        switch (estado) {
            case 'completado': return 'Completado';
            case 'en_progreso': return 'En Progreso';
            case 'no_iniciado': return 'No Iniciado';
            default: return estado;
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-brand-cream animate-scale-in">
            <header className="p-4 bg-brand-offwhite shadow-sm flex items-center justify-center sticky top-0 z-10 relative">
                <button onClick={onBack} className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors text-base">
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Volver</span>
                </button>
                <h1 className="text-xl font-bold text-center text-slate-800">Centro de Reportes</h1>
            </header>
            
            <div className="p-4 space-y-4">
                {loading ? (
                    <Card>
                        <p className="text-center text-slate-600">Cargando reportes...</p>
                    </Card>
                ) : reports.length > 0 ? (
                    reports.map(report => (
                        <Card key={report.id}>
                            <h2 className="text-lg font-bold text-slate-800">{report.titulo}</h2>
                            <div className="grid grid-cols-3 gap-4 text-center my-3">
                                <div>
                                    <p className="font-bold text-2xl text-brand-orange">{Math.round(report.promedio_puntuacion)}</p>
                                    <p className="text-xs text-slate-500">Promedio</p>
                                </div>
                                 <div>
                                    <p className="font-bold text-2xl text-brand-orange">{Math.round(report.tasa_completitud)}%</p>
                                    <p className="text-xs text-slate-500">Completado</p>
                                </div>
                                <div>
                                    <p className="font-bold text-2xl text-brand-orange">{report.total_estudiantes}</p>
                                    <p className="text-xs text-slate-500">Alumnos</p>
                                </div>
                            </div>
                            <ProgressBar progress={report.tasa_completitud} color="bg-brand-orange" />
                            <button
                                onClick={() => handleViewDetail(report)}
                                disabled={loadingDetail}
                                className="w-full mt-4 bg-brand-orange/20 text-brand-orange font-bold py-2 rounded-lg hover:bg-brand-orange/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                <EyeIcon className="w-5 h-5"/>
                                <span>{loadingDetail ? 'Cargando...' : 'Ver Detalle'}</span>
                            </button>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <p className="text-center text-slate-600">No hay reportes disponibles aún.</p>
                        <p className="text-center text-sm text-slate-500 mt-2">Los reportes aparecerán cuando los estudiantes completen lecciones.</p>
                    </Card>
                )}
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                  <div className="absolute inset-0 bg-black/50 flex items-end justify-center z-20 backdrop-blur-sm" onClick={() => setSelectedReport(null)}>
                      <div className="bg-brand-cream rounded-t-2xl pt-4 shadow-xl w-full max-w-sm h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                         <div className="px-4 pb-2">
                              <div className="text-center w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3"></div>
                              <div className="flex justify-between items-start">
                                 <div>
                                     <h2 className="text-lg font-bold text-slate-800">Reporte: {selectedReport.titulo}</h2>
                                     <p className="text-sm text-slate-600">Análisis de rendimiento detallado.</p>
                                 </div>
                                 <button onClick={() => setSelectedReport(null)} className="font-bold text-2xl text-slate-500">&times;</button>
                             </div>
                         </div>

                         <div className="overflow-y-auto px-4 space-y-4 flex-1 pb-4">
                             <Card>
                                 <h3 className="font-bold text-slate-700 mb-2">Desempeño Individual</h3>
                                 <ul className="space-y-3">
                                     {selectedReport.estudiantes.map(student => (
                                         <li key={student.nombre} className="flex items-center justify-between p-2 rounded-lg bg-brand-cream/70 text-sm">
                                             <div className="flex items-center">
                                                 <img src={student.avatar_url} alt={student.nombre} className="w-8 h-8 rounded-full mr-2 object-cover" />
                                                 <span className="font-semibold">{student.nombre}</span>
                                                 {student.puntuacion < 70 && student.estado === 'completado' && <span className="ml-2 text-xs font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Apoyo</span>}
                                             </div>
                                             <span className={`font-bold ${getScoreColor(student.puntuacion)}`}>{student.estado === 'completado' ? `${student.puntuacion} pts` : '-'}</span>
                                         </li>
                                     ))}
                                 </ul>
                             </Card>
                              <Card>
                                 <h3 className="font-bold text-slate-700 mb-2">Preguntas con Mayor Dificultad</h3>
                                 <ul className="space-y-2 text-sm text-slate-600">
                                     {selectedReport.preguntas_dificiles.slice(0, 5).map((pregunta, i) => (
                                         <li key={i} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                             <span className="flex-1">{pregunta.pregunta}</span>
                                             <span className="text-red-600 font-bold ml-2">{Math.round(pregunta.tasa_error * 100)}% error</span>
                                         </li>
                                     ))}
                                 </ul>
                             </Card>

                             {detailedReport && (
                                 <>
                                     <Card>
                                         <h3 className="font-bold text-slate-700 mb-2">Distribución de Puntuaciones</h3>
                                         <div className="space-y-2">
                                             <div className="flex justify-between text-sm">
                                                 <span>Excelente (80-100)</span>
                                                 <span className="font-bold text-green-600">{detailedReport.estadisticas.distribucion_puntuaciones.excelente}%</span>
                                             </div>
                                             <div className="flex justify-between text-sm">
                                                 <span>Bueno (60-79)</span>
                                                 <span className="font-bold text-blue-600">{detailedReport.estadisticas.distribucion_puntuaciones.bueno}%</span>
                                             </div>
                                             <div className="flex justify-between text-sm">
                                                 <span>Regular (40-59)</span>
                                                 <span className="font-bold text-yellow-600">{detailedReport.estadisticas.distribucion_puntuaciones.regular}%</span>
                                             </div>
                                             <div className="flex justify-between text-sm">
                                                 <span>Deficiente (0-39)</span>
                                                 <span className="font-bold text-red-600">{detailedReport.estadisticas.distribucion_puntuaciones.deficiente}%</span>
                                             </div>
                                         </div>
                                     </Card>

                                     <Card>
                                         <h3 className="font-bold text-slate-700 mb-2">Análisis de Preguntas</h3>
                                         <div className="space-y-3">
                                             {detailedReport.analisis_preguntas.slice(0, 3).map((pregunta, i) => (
                                                 <div key={i} className="p-3 bg-slate-50 rounded">
                                                     <p className="text-sm font-medium mb-1">{pregunta.pregunta_texto}</p>
                                                     <div className="flex justify-between text-xs">
                                                         <span>Tasa de aciertos: <strong>{Math.round(pregunta.tasa_aciertos * 100)}%</strong></span>
                                                         <span>Tiempo promedio: <strong>{Math.round(pregunta.tiempo_promedio)}s</strong></span>
                                                     </div>
                                                     <div className="mt-1">
                                                         <span className={`text-xs px-2 py-1 rounded ${
                                                             pregunta.dificultad === 'facil' ? 'bg-green-100 text-green-800' :
                                                             pregunta.dificultad === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                                                             'bg-red-100 text-red-800'
                                                         }`}>
                                                             {pregunta.dificultad === 'facil' ? 'Fácil' :
                                                              pregunta.dificultad === 'medio' ? 'Medio' : 'Difícil'}
                                                         </span>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </Card>
                                 </>
                             )}
                         </div>
                         <div className="p-4 bg-brand-offwhite/80 backdrop-blur-lg border-t border-brand-yellow-orange">
                             <button
                                 onClick={() => { setSelectedReport(null); setDetailedReport(null); }}
                                 className="w-full bg-brand-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-red-orange transition-colors flex items-center justify-center gap-2"
                             >
                                 <ArrowLeftIcon className="w-5 h-5" />
                                 <span>Volver a Reportes</span>
                             </button>
                         </div>
                      </div>
                  </div>
            )}
        </div>
    );
};

export default ReportsPage;