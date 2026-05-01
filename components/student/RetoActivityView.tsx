import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useXP } from '../../hooks/useXP';
import XPNotification from '../shared/XPNotification';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import apiService from '../../services/api';

interface RetoActivityViewProps {
  retoId: number;
  onBack: () => void;
}

interface Pregunta {
  id: number;
  pregunta: string;
  opciones?: string[];
  tipo?: string;
  tipo_pregunta?: string; // In case backend returns this
  respuesta_correcta?: number;
  elementos_arrastrables?: Array<{ id: string; texto: string; text?: string }>;
  zonas_destino?: Array<{ id: string; etiqueta: string; label?: string; elemento_correcto_id: string }>;
}

const RetoActivityView: React.FC<RetoActivityViewProps> = ({ retoId, onBack }) => {
  const { user } = useAuth();
  const { perfilXP, otorgarXP, ultimoXPGanado, mostrarNotificacion, cerrarNotificacion } = useXP(user?.id || null);

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [retoResult, setRetoResult] = useState<{ correctas: number; total: number; xp_ganado: number } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{ correcta: boolean; respuesta_correcta?: string } | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDrop = (zoneId: string) => {
    if (draggedItem) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          [zoneId]: draggedItem
        }
      }));
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        const data = await apiService.obtenerPreguntasReto(retoId);
        console.log('Preguntas recibidas:', data); // Debug
        setPreguntas(data);
      } catch (error) {
        console.error('Error fetching preguntas:', error);
        alert('Error al cargar las preguntas del reto.');
      } finally {
        setLoading(false);
      }
    };
    fetchPreguntas();
  }, [retoId]);

  const currentQuestion = preguntas[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === preguntas.length - 1;
  const isFillBlank = currentQuestion && (!currentQuestion.opciones || currentQuestion.opciones.length === 0);

  const handleAnswerChange = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion.tipo === 'drag_drop' || currentQuestion.tipo_pregunta === 'drag_drop') {
      // For drag_drop, just proceed to next question without verification
      if (isLastQuestion) {
        handleCompleteReto();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } else {
      // For other question types, verify immediately
      handleVerify();
    }
  };

  const handleVerify = async () => {
    const answer = answers[currentQuestion.id];
    let answerToSend: any = answer;

    // For other types, send as string
    if (!answer || (typeof answer === 'string' && !answer.trim())) {
      alert('Selecciona o ingresa una respuesta.');
      return;
    }
    answerToSend = typeof answer === 'string' ? answer : JSON.stringify(answer);

    try {
      const res = await apiService.verificarRespuestaReto(retoId, currentQuestion.id, answerToSend);
      setFeedback(res);
      setShowFeedback(true);

      // XP for individual questions in retos is handled by backend

      // Wait 2 seconds then proceed
      setTimeout(() => {
        setShowFeedback(false);
        setFeedback(null);
        if (isLastQuestion) {
          handleCompleteReto();
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }, 2000);
    } catch (error) {
      console.error('Error verifying answer:', error);
      alert('Error al verificar la respuesta.');
    }
  };

  const handleCompleteReto = async () => {
    // Submit all answers for verification
    const respuestas = preguntas.map(p => ({
      pregunta_id: p.id,
      respuesta: answers[p.id] || (p.tipo === 'drag_drop' || p.tipo_pregunta === 'drag_drop' ? {} : '')
    }));

    try {
      const res = await apiService.enviarRespuestasReto(retoId, respuestas);
      // Store the result to decide what UI to show
      setRetoResult({ correctas: res.correctas, total: res.total, xp_ganado: res.xp_ganado });
      setActivityCompleted(true);
    } catch (error) {
      console.error('Error completing reto:', error);
      alert('Error al completar el reto.');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-lg text-slate-600">Cargando reto...</p>
      </div>
    );
  }

  if (activityCompleted) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <header className="p-4 bg-brand-offwhite shadow-sm flex justify-between items-center">
          <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-800">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver
          </button>
          {perfilXP && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{perfilXP.nivel.icono}</span>
              <div>
                <p className="text-xs text-slate-500">Nivel {perfilXP.nivel.actual}</p>
                <p className="font-bold text-brand-orange">{perfilXP.xp.total} XP</p>
              </div>
            </div>
          )}
        </header>

        <div className="p-4">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">¡Reto Completado!</h2>
            {retoResult && retoResult.correctas === retoResult.total ? (
              <p className="text-lg text-slate-600 mb-6 text-center">¡Felicitaciones! Has completado todas las preguntas del reto correctamente.</p>
            ) : (
              <>
                <p className="text-lg text-slate-600 mb-6 text-center">
                  Has completado el reto. {retoResult && `Respondiste correctamente ${retoResult.correctas} de ${retoResult.total} preguntas.`}
                </p>

                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-slate-700">Resumen de respuestas:</h3>
                  {preguntas.map((pregunta, index) => {
                    const userAnswer = answers[pregunta.id];
                    let isCorrect = false;
                    if (pregunta.tipo === 'drag_drop' || pregunta.tipo_pregunta === 'drag_drop') {
                      const correctMapping = pregunta.zonas_destino?.reduce((acc, zona) => {
                        acc[zona.id] = zona.elemento_correcto_id;
                        return acc;
                      }, {} as any) || {};
                      isCorrect = JSON.stringify(userAnswer || {}) === JSON.stringify(correctMapping);
                    } else if (pregunta.opciones && pregunta.respuesta_correcta !== undefined) {
                      isCorrect = userAnswer === pregunta.respuesta_correcta;
                    } else if (pregunta.opciones && pregunta.opciones.length === 1) {
                      // Fill blank
                      isCorrect = (userAnswer as string)?.toLowerCase().trim() === pregunta.opciones[0].toLowerCase().trim();
                    }

                    return (
                      <div key={pregunta.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {isCorrect ? '✓' : '✗'}
                          </span>
                          <span className="font-semibold">Pregunta {index + 1}:</span>
                          <span className="text-sm text-slate-600">{pregunta.pregunta}</span>
                        </div>

                        {pregunta.tipo === 'drag_drop' || pregunta.tipo_pregunta === 'drag_drop' ? (
                          <div className="ml-8">
                            <p className="text-sm font-medium text-slate-700 mb-2">Respuesta correcta:</p>
                            <div className="space-y-1">
                              {pregunta.zonas_destino?.map((zona) => {
                                const correctElement = pregunta.elementos_arrastrables?.find(el => el.id === zona.elemento_correcto_id);
                                return (
                                  <div key={zona.id} className="text-sm">
                                    <span className="font-medium">{zona.etiqueta || zona.label}:</span>
                                    <span className="ml-2 text-slate-600">{correctElement?.texto || correctElement?.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : pregunta.opciones && pregunta.respuesta_correcta !== undefined ? (
                          <div className="ml-8">
                            <p className="text-sm text-slate-600">
                              Tu respuesta: <span className="font-medium">{typeof userAnswer === 'number' && pregunta.opciones[userAnswer] || 'No respondida'}</span>
                            </p>
                            <p className="text-sm text-slate-600">
                              Respuesta correcta: <span className="font-medium">{pregunta.opciones[pregunta.respuesta_correcta]}</span>
                            </p>
                          </div>
                        ) : pregunta.opciones && pregunta.opciones.length === 1 ? (
                          <div className="ml-8">
                            <p className="text-sm text-slate-600">
                              Tu respuesta: <span className="font-medium">{userAnswer as string || 'No respondida'}</span>
                            </p>
                            <p className="text-sm text-slate-600">
                              Respuesta correcta: <span className="font-medium">{pregunta.opciones[0]}</span>
                            </p>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="text-center">
              <button
                onClick={onBack}
                className="bg-brand-orange text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-red-orange transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>

        {mostrarNotificacion && ultimoXPGanado && (
          <XPNotification
            xpGanado={ultimoXPGanado!.xp_ganado}
            subioNivel={ultimoXPGanado!.subio_nivel}
            nivelNuevo={ultimoXPGanado!.nivel_nuevo}
            tituloNivel={ultimoXPGanado!.titulo_nivel}
            iconoNivel={ultimoXPGanado!.icono_nivel}
            onClose={cerrarNotificacion}
          />
        )}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-lg text-slate-600">No hay preguntas disponibles.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="p-4 bg-brand-offwhite shadow-sm flex justify-between items-center">
        <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-800">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Volver
        </button>
        {perfilXP && (
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{perfilXP.nivel.icono}</span>
            <div>
              <p className="text-xs text-slate-500">Nivel {perfilXP.nivel.actual}</p>
              <p className="font-bold text-brand-orange">{perfilXP.xp.total} XP</p>
            </div>
          </div>
        )}
      </header>

      <div className="p-4">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">Pregunta {currentQuestionIndex + 1} de {preguntas.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-brand-orange h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / preguntas.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-6">{currentQuestion.pregunta}</h2>

          {(currentQuestion.tipo === 'drag_drop' || currentQuestion.tipo_pregunta === 'drag_drop') ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Elementos disponibles:</h4>
                <div className="flex flex-wrap gap-2">
                  {(currentQuestion.elementos_arrastrables || (currentQuestion as any)[0]?.elementos_arrastrables || (currentQuestion.opciones && JSON.parse(currentQuestion.opciones[0])?.elementos_arrastrables))?.map((item: any) => (
                    <div
                      key={item.id}
                      draggable={!showFeedback}
                      onDragStart={() => handleDragStart(item.id)}
                      className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg cursor-move hover:bg-blue-200 transition-colors"
                    >
                      {item.texto || item.text}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Arrastra los elementos a las zonas correctas:</h4>
                <div className="space-y-3">
                  {(currentQuestion.zonas_destino || (currentQuestion as any)[1]?.zonas_destino || (currentQuestion.opciones && JSON.parse(currentQuestion.opciones[0])?.zonas_destino))?.map((zone: any) => {
                    const placedItemId = answers[currentQuestion.id]?.[zone.id];
                    const elementos = currentQuestion.elementos_arrastrables || (currentQuestion as any)[0]?.elementos_arrastrables || (currentQuestion.opciones && JSON.parse(currentQuestion.opciones[0])?.elementos_arrastrables);
                    const placedItem = elementos?.find((item: any) => item.id === placedItemId);
                    const isCorrect = showFeedback && placedItemId === zone.elemento_correcto_id;
                    const isIncorrect = showFeedback && placedItemId && placedItemId !== zone.elemento_correcto_id;

                    return (
                      <div
                        key={zone.id}
                        onDrop={() => handleDrop(zone.id)}
                        onDragOver={handleDragOver}
                        className={`border-2 border-dashed p-4 rounded-lg min-h-[60px] flex items-center justify-center transition-colors ${
                          placedItem
                            ? showFeedback
                              ? isCorrect
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-blue-500 bg-blue-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {placedItem ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{zone.etiqueta || zone.label}:</span>
                            <span className={`px-2 py-1 rounded ${showFeedback ? (isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800') : 'bg-blue-200 text-blue-800'}`}>
                              {placedItem.texto || placedItem.text}
                            </span>
                            {showFeedback && isCorrect && <span className="text-green-600">✓</span>}
                            {showFeedback && isIncorrect && <span className="text-red-600">✗</span>}
                          </div>
                        ) : (
                          <span className="text-slate-500">{zone.etiqueta || zone.label}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : isFillBlank ? (
            <div className="space-y-3">
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Escribe tu respuesta aquí"
                className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-brand-orange focus:outline-none text-slate-700"
              />
            </div>
          ) : currentQuestion.opciones && currentQuestion.opciones.length > 0 ? (
            <div className="space-y-3">
              {currentQuestion.opciones!.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(index.toString())}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === index.toString()
                      ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          ) : null}

          {showFeedback && feedback && (
            <div className="mt-6 p-4 rounded-lg bg-slate-50">
              <p className={`font-bold ${feedback.correcta ? 'text-green-600' : 'text-red-600'}`}>
                {feedback.correcta ? '¡Correcto!' : 'Incorrecto'}
              </p>
              {!feedback.correcta && feedback.respuesta_correcta && (
                <div className="mt-2">
                  <p className="text-sm text-slate-600">
                    La respuesta correcta es: <span className="font-semibold text-slate-800">{feedback.respuesta_correcta}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              disabled={
                (currentQuestion.tipo === 'drag_drop' || currentQuestion.tipo_pregunta === 'drag_drop')
                  ? !answers[currentQuestion.id] || Object.keys(answers[currentQuestion.id] || {}).length === 0
                  : !answers[currentQuestion.id] || (typeof answers[currentQuestion.id] === 'string' && !answers[currentQuestion.id].trim()) || showFeedback
              }
              className="bg-brand-orange text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-red-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {(currentQuestion.tipo === 'drag_drop' || currentQuestion.tipo_pregunta === 'drag_drop')
                ? (isLastQuestion ? 'Finalizar Reto' : 'Siguiente')
                : 'Verificar'
              }
            </button>
          </div>
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
};

export default RetoActivityView;