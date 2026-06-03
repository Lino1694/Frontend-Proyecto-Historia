import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { EyeIcon } from '../icons/EyeIcon';
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
}

interface Question {
    pregunta: string;
    opciones: string[];
    respuesta_correcta: number | string;
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

const ChallengesCenter: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [challengeReport, setChallengeReport] = useState<ReportData | null>(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const [newChallenge, setNewChallenge] = useState({
        title: '',
        description: '',
        tipo: 'individual' as 'individual' | 'competition',
        xp_recompensa: 100,
        fecha_fin: '',
        categoria: 'Avanzando en la Historia - La Batalla de Angamos',
        max_intentos: 3
    });
    const [preguntas, setPreguntas] = useState<Question[]>([{
        pregunta: '',
        opciones: ['', '', '', ''],
        respuesta_correcta: 0
    }]);

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
                    endDate: r.fecha_fin
                }));
                setChallenges(formattedChallenges);
            } catch (error) {
                console.error('Error fetching retos:', error);
            }
        };
        fetchRetos();
    }, []);

    const handleCreateChallenge = async () => {
        if (!newChallenge.title || !newChallenge.fecha_fin) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.crearReto({
                titulo: newChallenge.title,
                descripcion: newChallenge.description,
                tipo: newChallenge.tipo,
                xp_recompensa: newChallenge.xp_recompensa,
                fecha_fin: newChallenge.fecha_fin,
                max_intentos: newChallenge.max_intentos,
                categoria: newChallenge.categoria,
                preguntas: preguntas.filter(p => p.pregunta.trim() !== '')
            });

            const newChallengeItem: Challenge = {
                id: response.id,
                title: newChallenge.title,
                description: newChallenge.description,
                type: newChallenge.tipo,
                xpReward: newChallenge.xp_recompensa,
                participants: 0,
                status: 'active',
                endDate: newChallenge.fecha_fin,
                categoria: newChallenge.categoria
            };
            setChallenges([...challenges, newChallengeItem]);
            
            setNewChallenge({
                title: '',
                description: '',
                tipo: 'individual',
                xp_recompensa: 100,
                fecha_fin: '',
                categoria: 'Avanzando en la Historia - La Batalla de Angamos',
                max_intentos: 3
            });
            setPreguntas([{ pregunta: '', opciones: ['', '', '', ''], respuesta_correcta: 0 }]);
            setShowCreateForm(false);
        } catch (error) {
            console.error('Error creating challenge:', error);
            alert('Error al crear el reto');
        } finally {
            setLoading(false);
        }
    };

    const addPregunta = () => {
        setPreguntas([...preguntas, { pregunta: '', opciones: ['', '', '', ''], respuesta_correcta: 0 }]);
    };

    const updatePregunta = (index: number, field: string, value: any) => {
        const updated = [...preguntas];
        updated[index] = { ...updated[index], [field]: value };
        setPreguntas(updated);
    };

    const updateOpcion = (preguntaIndex: number, opcionIndex: number, value: string) => {
        const updated = [...preguntas];
        updated[preguntaIndex].opciones[opcionIndex] = value;
        setPreguntas(updated);
    };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-cream">
      <header className="p-4 bg-brand-offwhite shadow-sm flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="font-bold text-2xl text-slate-600">{'<'}</button>
        <h1 className="text-xl font-bold text-center text-slate-800 flex-1">Centro de Retos y Competencias</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-700">Retos Activos</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-red-orange transition-colors"
          >
            + Nuevo Reto
          </button>
        </div>

        {showCreateForm && (
            <Card>
                <h3 className="text-lg font-bold text-slate-700 mb-4">Crear Nuevo Reto</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-600 text-sm font-bold mb-2">Título</label>
                        <input
                            type="text"
                            value={newChallenge.title}
                            onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                            placeholder="Ej: Maratón de Historia"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-600 text-sm font-bold mb-2">Descripción</label>
                        <textarea
                            value={newChallenge.description}
                            onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                            rows={3}
                            placeholder="Describe el reto..."
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-slate-600 text-sm font-bold mb-2">Tipo</label>
                            <select
                                value={newChallenge.tipo}
                                onChange={(e) => setNewChallenge({...newChallenge, tipo: e.target.value as 'individual' | 'competition'})}
                                className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                            >
                                <option value="individual">Individual</option>
                                <option value="competition">Competencia</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-600 text-sm font-bold mb-2">XP Recompensa</label>
                            <input
                                type="number"
                                value={newChallenge.xp_recompensa}
                                onChange={(e) => setNewChallenge({...newChallenge, xp_recompensa: parseInt(e.target.value) || 0})}
                                className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-600 text-sm font-bold mb-2">Máx Intentos</label>
                            <input
                                type="number"
                                value={newChallenge.max_intentos}
                                onChange={(e) => setNewChallenge({...newChallenge, max_intentos: parseInt(e.target.value) || 0})}
                                className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                                min="1"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-600 text-sm font-bold mb-2">Categoría</label>
                        <select
                            value={newChallenge.categoria}
                            onChange={(e) => setNewChallenge({...newChallenge, categoria: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                        >
                            <option value="Avanzando en la Historia - La Batalla de Angamos">La Batalla de Angamos</option>
                            <option value="Avanzando en la Historia - Cultura Inca">Cultura Inca</option>
                            <option value="Avanzando en la Historia - Caral">Caral</option>
                            <option value="Avanzando en la Historia - Virreinato">Virreinato</option>
                            <option value="Avanzando en la Historia - Independencia">Independencia</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-slate-600 text-sm font-bold mb-2">Fecha de Fin</label>
                        <input
                            type="date"
                            value={newChallenge.fecha_fin}
                            onChange={(e) => setNewChallenge({...newChallenge, fecha_fin: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-slate-600 text-sm font-bold mb-2">Preguntas del Reto</label>
                        {preguntas.map((pregunta, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-3 mb-3">
                                <input
                                    type="text"
                                    value={pregunta.pregunta}
                                    onChange={(e) => updatePregunta(index, 'pregunta', e.target.value)}
                                    className="w-full px-3 py-2 rounded bg-brand-cream border mb-2"
                                    placeholder={`Pregunta ${index + 1}`}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    {pregunta.opciones.map((opcion, opcionIndex) => (
                                        <input
                                            key={opcionIndex}
                                            type="text"
                                            value={opcion}
                                            onChange={(e) => updateOpcion(index, opcionIndex, e.target.value)}
                                            className="w-full px-3 py-1 rounded bg-brand-cream border"
                                            placeholder={`Opción ${opcionIndex + 1}`}
                                        />
                                    ))}
                                </div>
                                <select
                                    value={pregunta.respuesta_correcta}
                                    onChange={(e) => updatePregunta(index, 'respuesta_correcta', parseInt(e.target.value))}
                                    className="w-full px-3 py-1 rounded bg-brand-cream border mt-2"
                                >
                                    <option value={0}>Opción 1 es correcta</option>
                                    <option value={1}>Opción 2 es correcta</option>
                                    <option value={2}>Opción 3 es correcta</option>
                                    <option value={3}>Opción 4 es correcta</option>
                                </select>
                            </div>
                        ))}
                        <button
                            onClick={addPregunta}
                            className="text-brand-orange text-sm font-semibold hover:underline"
                        >
                            + Agregar Pregunta
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateChallenge}
                            disabled={loading}
                            className="bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-red-orange transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creando...' : 'Crear Reto'}
                        </button>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-400 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Card>
        )}

        <div className="space-y-4">
          {challenges.map((challenge) => (
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
                  <button className="bg-brand-yellow-orange text-slate-800 font-bold py-1 px-3 rounded-lg hover:bg-brand-light-orange transition-colors text-sm">
                    Editar
                  </button>
                  <button className="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm">
                    Eliminar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {challenges.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-slate-600">No hay retos activos</p>
              <p className="text-sm text-slate-500 mt-2">Crea tu primer reto para motivar a los estudiantes</p>
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
                      <p className="font-bold text-2xl text-brand-orange">{Math.round(challengeReport.promedio_puntuacion)}</p>
                      <p className="text-xs text-slate-500">Promedio XP</p>
                    </div>
                    <div>
                      <p className="font-bold text-2xl text-brand-orange">{Math.round(challengeReport.tasa_completitud)}%</p>
                      <p className="text-xs text-slate-500">Completado</p>
                    </div>
                  </div>
                  <ProgressBar progress={challengeReport.tasa_completitud} color="bg-brand-orange" />
                </Card>
              </div>

              <div className="p-4 bg-brand-offwhite/80 backdrop-blur-lg border-t border-brand-yellow-orange">
                <button
                  onClick={() => { setSelectedChallenge(null); setChallengeReport(null); }}
                  className="w-full bg-brand-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-red-orange transition-colors flex items-center justify-center gap-2"
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