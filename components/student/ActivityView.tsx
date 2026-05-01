import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useXP } from '../../hooks/useXP';
import XPNotification from '../shared/XPNotification';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

interface ActivityViewProps {
  onBack: () => void;
}

const ActivityView: React.FC<ActivityViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { perfilXP, otorgarXP, ultimoXPGanado, mostrarNotificacion, cerrarNotificacion } = useXP(user?.id || null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState(false);

  // Preguntas del cuestionario del Virreinato
  const questions = [
    {
      id: '1',
      question: '¿En qué año llegó Francisco Pizarro a Perú?',
      options: [
        { id: 'a', text: '1492' },
        { id: 'b', text: '1532' },
        { id: 'c', text: '1542' },
        { id: 'd', text: '1552' }
      ],
      correctAnswer: 'b',
      points: 10,
      explanation: 'Francisco Pizarro llegó a Perú en 1532, después de su tercer viaje al continente americano. Este año marca el inicio de la conquista española del Imperio Inca.'
    },
    {
      id: '2',
      question: '¿Cuál fue la capital del Virreinato del Perú?',
      options: [
        { id: 'a', text: 'Cusco' },
        { id: 'b', text: 'Lima' },
        { id: 'c', text: 'Arequipa' },
        { id: 'd', text: 'Trujillo' }
      ],
      correctAnswer: 'b',
      points: 10,
      explanation: 'Lima fue fundada por Francisco Pizarro en 1535 y se convirtió en la capital del Virreinato del Perú. Su ubicación estratégica en la costa facilitaba el comercio con España.'
    },
    {
      id: '3',
      question: '¿Qué institución española controlaba el comercio en el Virreinato?',
      options: [
        { id: 'a', text: 'La Casa de Contratación' },
        { id: 'b', text: 'La Inquisición' },
        { id: 'c', text: 'El Cabildo' },
        { id: 'd', text: 'La Audiencia' }
      ],
      correctAnswer: 'a',
      points: 15,
      explanation: 'La Casa de Contratación, establecida en Sevilla en 1503, monopolizaba todo el comercio entre España y sus colonias americanas, incluyendo el Virreinato del Perú.'
    },
    {
      id: '4',
      question: '¿Cuál fue el principal producto de exportación del Virreinato?',
      options: [
        { id: 'a', text: 'Café' },
        { id: 'b', text: 'Azúcar' },
        { id: 'c', text: 'Plata' },
        { id: 'd', text: 'Algodón' }
      ],
      correctAnswer: 'c',
      points: 15,
      explanation: 'La plata extraída de las minas de Potosí y otras regiones fue el principal motor económico del Virreinato. Representaba más del 80% de las exportaciones hacia España.'
    },
    {
      id: '5',
      question: '¿Qué movimiento independentista lideró Túpac Amaru II?',
      options: [
        { id: 'a', text: 'La rebelión de los comuneros' },
        { id: 'b', text: 'La gran rebelión de 1780' },
        { id: 'c', text: 'La revolución de 1810' },
        { id: 'd', text: 'La guerra del Pacífico' }
      ],
      correctAnswer: 'b',
      points: 20,
      explanation: 'Túpac Amaru II lideró la Gran Rebelión de 1780-1782, la mayor insurrección indígena contra el dominio español en América. Fue un precursor de los movimientos independentistas del siglo XIX.'
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setShowResult(true);

    if (isCorrect) {
      await otorgarXP(
        currentQuestion.points,
        'respuesta_correcta',
        `Respuesta correcta en pregunta ${currentQuestionIndex + 1}`
      );
      setTotalScore(prev => prev + currentQuestion.points);
    }

    // Esperar 2 segundos antes de continuar
    setTimeout(() => {
      if (isLastQuestion) {
        handleCompleteActivity();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 2000);
  };

  const handleCompleteActivity = async () => {
    const xpTotal = totalScore;

    await otorgarXP(
      xpTotal,
      'actividad_completada',
      'Completó el cuestionario del Virreinato',
      1
    );

    setActivityCompleted(true);

    // Dispatch event to mark mission as completed
    window.dispatchEvent(new CustomEvent('missionCompleted', { detail: { missionId: 3 } }));
  };

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

        <div className="p-4 text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">¡Actividad Completada!</h2>
            <p className="text-lg text-slate-600 mb-4">Has ganado {totalScore} XP</p>
            <button
              onClick={onBack}
              className="bg-brand-orange text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-red-orange transition-colors"
            >
              Volver al Inicio
            </button>
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
              <span className="text-sm text-slate-500">Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
              <span className="text-sm font-bold text-brand-orange">{currentQuestion.points} XP</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-brand-orange h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-6">{currentQuestion.question}</h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option.id
                    ? showResult
                      ? selectedAnswer === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-red-500 bg-red-50 text-red-800'
                      : 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                    : showResult && option.id === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="font-semibold mr-3">{option.id.toUpperCase()}.</span>
                {option.text}
              </button>
            ))}
          </div>

          {showResult && (
            <div className="mt-6 p-4 rounded-lg bg-slate-50">
              <p className={`font-bold ${selectedAnswer === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                {selectedAnswer === currentQuestion.correctAnswer ? '¡Correcto!' : 'Incorrecto'}
              </p>
              {selectedAnswer !== currentQuestion.correctAnswer && (
                <div className="mt-2">
                  <p className="text-sm text-slate-600">
                    La respuesta correcta es: <span className="font-semibold text-slate-800">{currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswer)?.text}</span>
                  </p>
                  {currentQuestion.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Explicación:</span> {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Puntaje actual: <span className="font-bold text-brand-orange">{totalScore} XP</span>
            </div>
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || showResult}
              className="bg-brand-orange text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-red-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLastQuestion ? 'Finalizar' : 'Siguiente'}
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

export default ActivityView;