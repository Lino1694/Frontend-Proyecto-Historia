import React, { useState } from 'react';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useXP } from '../../hooks/useXP';
import XPNotification from '../shared/XPNotification';
import apiService from '../../services/api';

interface LessonViewProps {
  lesson: {
    id: number;
    titulo: string;
    descripcion: string;
    contenido: string;
    imagen_url?: string;
    multimedia?: Array<{
      id: string;
      tipo: 'video' | 'audio' | 'imagen';
      url: string;
      titulo?: string;
      descripcion?: string;
    }>;
    preguntas?: Array<{
      pregunta: string;
      opciones: string[];
      respuesta_correcta: number;
      tipo?: string;
      elementos_arrastrables?: Array<{ id: string; texto: string }>;
      zonas_destino?: Array<{ id: string; etiqueta: string; elemento_correcto_id: string }>;
    }>;
  };
  onBack: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, onBack }) => {
  const { user } = useAuth();
  const { perfilXP, ultimoXPGanado, mostrarNotificacion, cerrarNotificacion } = useXP(user?.id || null);

  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDrop = (questionIndex: number, zoneId: string) => {
    if (draggedItem) {
      setAnswers(prev => ({
        ...prev,
        [questionIndex]: {
          ...prev[questionIndex],
          [zoneId]: draggedItem
        }
      }));
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const calculateScore = () => {
    if (!lesson.preguntas) return 0;
    let correct = 0;
    lesson.preguntas.forEach((pregunta, index) => {
      if (pregunta.opciones.length > 1) {
        // Multiple choice
        if (answers[index] === pregunta.respuesta_correcta.toString()) {
          correct++;
        }
      } else {
        // Fill in the blank
        if (answers[index]?.toLowerCase().trim() === pregunta.opciones[0].toLowerCase().trim()) {
          correct++;
        }
      }
    });
    return correct;
  };

  const handleCompleteLesson = async () => {
    const correctAnswers = calculateScore();
    const totalQuestions = lesson.preguntas?.length || 0;

    try {
      await apiService.completarLeccion(lesson.id, correctAnswers, totalQuestions);
      // Automatically return to dashboard after successful completion
      onBack();
    } catch (error: any) {
      console.error('Error completing lesson:', error);
      if (error.message && error.message.includes('Ya has completado esta lección')) {
        alert('Ya has completado esta lección, regresa al inicio');
        onBack();
      } else {
        alert('Error al completar la lección. Inténtalo de nuevo.');
      }
    }
  };
  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="p-4 bg-brand-offwhite shadow-sm flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors text-base mr-4">
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Volver</span>
        </button>
        <h1 className="text-xl font-bold text-center text-slate-800 flex-1">{lesson.titulo}</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          {lesson.imagen_url && (
            <div className="mb-6">
              <img
                src={lesson.imagen_url}
                alt={lesson.titulo}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="mb-6">
            <p className="text-slate-600 text-lg">{lesson.descripcion}</p>
          </div>

          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
              {lesson.contenido}
            </div>
          </div>

          {lesson.multimedia && lesson.multimedia.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Contenido Multimedia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.multimedia.map((media) => (
                  <div key={media.id} className="bg-slate-50 p-4 rounded-lg">
                    {media.tipo === 'video' && (
                      <div>
                        <video
                          controls
                          className="w-full rounded-lg"
                          src={media.url}
                        >
                          Tu navegador no soporta el elemento de video.
                        </video>
                      </div>
                    )}
                    {media.tipo === 'audio' && (
                      <div>
                        <audio
                          controls
                          className="w-full"
                          src={media.url}
                        >
                          Tu navegador no soporta el elemento de audio.
                        </audio>
                      </div>
                    )}
                    {media.tipo === 'imagen' && (
                      <div>
                        <img
                          src={media.url}
                          alt={media.titulo || 'Imagen'}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {media.titulo && (
                      <h4 className="font-semibold text-slate-800 mt-2">{media.titulo}</h4>
                    )}
                    {media.descripcion && (
                      <p className="text-sm text-slate-600 mt-1">{media.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {lesson.preguntas && lesson.preguntas.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Preguntas de Evaluación</h3>
              <div className="space-y-6">
                {lesson.preguntas.map((pregunta, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      {index + 1}. {pregunta.pregunta}
                    </h4>
                    {pregunta.opciones.length > 1 ? (
                      <div className="space-y-2">
                        {pregunta.opciones.map((opcion, i) => {
                          const isSelected = answers[index] === i.toString();
                          const isCorrect = i === pregunta.respuesta_correcta;
                          return (
                            <button
                              key={i}
                              onClick={() => !showResults && setAnswers(prev => ({ ...prev, [index]: i.toString() }))}
                              disabled={showResults}
                              className={`w-full text-left p-3 rounded-lg border transition-all ${
                                showResults
                                  ? isCorrect
                                    ? 'border-green-500 bg-green-50 text-green-800'
                                    : isSelected
                                    ? 'border-red-500 bg-red-50 text-red-800'
                                    : 'border-slate-200 bg-white text-slate-700'
                                  : isSelected
                                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span className="font-medium mr-3">{String.fromCharCode(65 + i)}.</span>
                              {opcion}
                              {showResults && isCorrect && <span className="ml-2 text-green-600">✓</span>}
                              {showResults && isSelected && !isCorrect && <span className="ml-2 text-red-600">✗</span>}
                            </button>
                          );
                        })}
                      </div>
                    ) : pregunta.tipo === 'drag_drop' ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3">Elementos disponibles:</h4>
                          <div className="flex flex-wrap gap-2">
                            {pregunta.elementos_arrastrables?.map((item) => (
                              <div
                                key={item.id}
                                draggable={!showResults}
                                onDragStart={() => handleDragStart(item.id)}
                                className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg cursor-move hover:bg-blue-200 transition-colors"
                              >
                                {item.texto}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Arrastra los elementos a las zonas correctas:</h4>
                          <div className="space-y-3">
                            {pregunta.zonas_destino?.map((zone) => {
                              const placedItemId = answers[index]?.[zone.id];
                              const placedItem = pregunta.elementos_arrastrables?.find(item => item.id === placedItemId);
                              const isCorrect = showResults && placedItemId === zone.elemento_correcto_id;
                              const isIncorrect = showResults && placedItemId && placedItemId !== zone.elemento_correcto_id;

                              return (
                                <div
                                  key={zone.id}
                                  onDrop={() => handleDrop(index, zone.id)}
                                  onDragOver={handleDragOver}
                                  className={`border-2 border-dashed p-4 rounded-lg min-h-[60px] flex items-center justify-center transition-colors ${
                                    placedItem
                                      ? showResults
                                        ? isCorrect
                                          ? 'border-green-500 bg-green-50'
                                          : 'border-red-500 bg-red-50'
                                        : 'border-blue-500 bg-blue-50'
                                      : 'border-slate-300 hover:border-slate-400'
                                  }`}
                                >
                                  {placedItem ? (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{zone.etiqueta}:</span>
                                      <span className={`px-2 py-1 rounded ${showResults ? (isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800') : 'bg-blue-200 text-blue-800'}`}>
                                        {placedItem.texto}
                                      </span>
                                      {showResults && isCorrect && <span className="text-green-600">✓</span>}
                                      {showResults && isIncorrect && <span className="text-red-600">✗</span>}
                                    </div>
                                  ) : (
                                    <span className="text-slate-500">{zone.etiqueta}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : pregunta.opciones.length === 1 ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Escribe tu respuesta aquí"
                          value={answers[index] || ''}
                          onChange={(e) => !showResults && setAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                          disabled={showResults}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                        />
                        {showResults && (
                          <div className={`p-3 rounded-lg ${answers[index]?.toLowerCase().trim() === pregunta.opciones[0].toLowerCase().trim() ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            Respuesta correcta: {pregunta.opciones[0]}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              {!showResults ? (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowResults(true)}
                    disabled={Object.keys(answers).length < lesson.preguntas.length}
                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Verificar Respuestas
                  </button>
                </div>
              ) : (
                <div className="mt-6 text-center space-y-3">
                  <button
                    onClick={() => {
                      setAnswers({});
                      setShowResults(false);
                    }}
                    className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors mr-2"
                  >
                    Intentar de Nuevo
                  </button>
                  <button
                    onClick={handleCompleteLesson}
                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Completar Lección
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mostrarNotificacion && ultimoXPGanado && (
        <XPNotification
          xpGanado={ultimoXPGanado.xp_ganado}
          subioNivel={ultimoXPGanado.subio_nivel}
          nivelNuevo={ultimoXPGanado.nivel_nuevo}
          tituloNivel={ultimoXPGanado.titulo_nivel}
          iconoNivel={ultimoXPGanado.icono_nivel}
          onClose={cerrarNotificacion}
        />
      )}
    </div>
  );


  return null; // This should never be reached, but TypeScript needs it
};

export default LessonView;