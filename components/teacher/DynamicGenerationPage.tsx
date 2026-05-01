import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { TrophyIcon } from '../icons/TrophyIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { useAuth } from '../../contexts/AuthContext';

interface DynamicGenerationPageProps {
  onBack: () => void;
}

const characters = [
  { id: 'inka', name: 'Apu Huallpa (Imperio Inca)', avatar: '🦙' },
  { id: 'caral', name: 'Sacerdote de Caral', avatar: '🏛️' },
  { id: 'viceroyalty', name: 'Don Francisco de Toledo (Virreinato)', avatar: '🏰' },
  { id: 'conquistador', name: 'Don Francisco de Ávila (Conquista)', avatar: '⚔️' },
  { id: 'independencia', name: 'Don José de la Mar (Independencia)', avatar: '🕊️' },
  { id: 'republica', name: 'Don Manuel Prado (República)', avatar: '📜' }
];

const DynamicGenerationPage: React.FC<DynamicGenerationPageProps> = ({ onBack }) => {
  const { token } = useAuth();
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [generatedLesson, setGeneratedLesson] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [generatedChallenge, setGeneratedChallenge] = useState('');
  const [challengeCharacter, setChallengeCharacter] = useState('');
  const [challengeTopic, setChallengeTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [challengeDifficulty, setChallengeDifficulty] = useState('fácil');
  const [challengeQuestions, setChallengeQuestions] = useState<any[]>([]);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [isEditingQuestion, setIsEditingQuestion] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const parseChallengeToQuestions = (challengeText: string) => {
    const lines = challengeText.split('\n').map(line => line.trim()).filter(line => line);
    const questions: any[] = [];
    let currentQuestion: any = null;

    for (const line of lines) {
      if (line.toLowerCase().includes('pregunta') && /\d+/.test(line)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        const colonIndex = line.indexOf(':');
        let questionText = colonIndex > -1 ? line.substring(colonIndex + 1).trim() : line;
        // Clean markdown formatting
        questionText = questionText.replace(/^\*\*(.*?)\*\*$/, '$1').trim();
        // Remove difficulty indicator if present
        questionText = questionText.replace(/\s*\([^)]*\)\s*$/, '').trim();
        currentQuestion = {
          id: `q_${Date.now()}_${questions.length}`,
          questionText,
          options: [],
          correctOptionId: '',
          explanation: '',
          points: 10
        };
      } else if (/^[A-C][).\s]/.test(line)) {
        if (currentQuestion) {
          const optionId = line[0];
          let optionText = line.substring(line.indexOf(' ') + 1).trim();
          // Clean markdown
          optionText = optionText.replace(/^\*\*(.*?)\*\*$/, '$1').trim();
          currentQuestion.options.push({
            id: optionId,
            text: optionText
          });
        }
      } else if (line.toLowerCase().includes('respuesta correcta')) {
        if (currentQuestion) {
          const colonIndex = line.indexOf(':');
          let correct = colonIndex > -1 ? line.substring(colonIndex + 1).trim() : '';
          // Clean markdown
          correct = correct.replace(/^\*\*(.*?)\*\*$/, '$1').trim();
          if (correct && /^[A-C]$/.test(correct)) {
            currentQuestion.correctOptionId = correct;
          }
        }
      } else if (line.toLowerCase().includes('explicación')) {
        if (currentQuestion) {
          const colonIndex = line.indexOf(':');
          let explanation = colonIndex > -1 ? line.substring(colonIndex + 1).trim() : line;
          // Clean markdown
          explanation = explanation.replace(/^\*\*(.*?)\*\*$/, '$1').trim();
          currentQuestion.explanation = explanation;
        }
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    setChallengeQuestions(questions);
  };

  useEffect(() => {
    if (generatedChallenge) {
      parseChallengeToQuestions(generatedChallenge);
    }
  }, [generatedChallenge]);

  const handleAddNewQuestion = () => {
    setIsEditingQuestion({
      id: `q_${Date.now()}`,
      type: 'multiple_choice',
      questionText: '',
      points: 10,
      options: [],
      correctOptionId: '',
    });
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setIsEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      setChallengeQuestions(challengeQuestions.filter(q => q.id !== questionId));
    }
  };

  const handleSaveQuestion = (question: any) => {
    const existingIndex = challengeQuestions.findIndex(q => q.id === question.id);
    if (existingIndex > -1) {
      const updatedQuestions = [...challengeQuestions];
      updatedQuestions[existingIndex] = question;
      setChallengeQuestions(updatedQuestions);
    } else {
      setChallengeQuestions([...challengeQuestions, question]);
    }
    setIsModalOpen(false);
    setIsEditingQuestion(null);
  };

  const publishChallenge = async () => {
    if (!challengeTitle.trim()) {
      alert('Por favor, ingresa un título para el reto');
      return;
    }
    if (challengeQuestions.length === 0) {
      alert('No hay preguntas en el reto');
      return;
    }

    // Calcular fecha 90 días en el futuro para asegurar que sea futuro
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + 90);
    const fechaFinStr = futureDate.toISOString().split('T')[0];
    console.log('Publicando reto con fecha fin:', fechaFinStr, 'Fecha actual:', now.toISOString());

    const preguntas = challengeQuestions.map(q => ({
      pregunta: q.questionText,
      opciones: q.options.map((o: any) => o.text),
      respuesta_correcta: q.options.findIndex((o: any) => o.id === q.correctOptionId)
    }));

    try {
      await fetch('http://localhost:5000/api/retos/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: challengeTitle,
          descripcion: `Reto generado automáticamente sobre ${challengeTopic}`,
          tipo: 'individual',
          xp_recompensa: challengeQuestions.length * 10,
          fecha_fin: fechaFinStr,
          max_intentos: challengeQuestions.length + 2, // Permitir más intentos que preguntas
          preguntas
        })
      });

      alert('Reto publicado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar el reto. Verifica tu conexión.');
    }
  };

  const publishLesson = async () => {
    if (!generatedLesson.trim()) {
      alert('No hay lección generada para publicar');
      return;
    }

    if (!lessonTitle.trim()) {
      alert('Por favor, ingresa un título para la lección');
      return;
    }

    // Remove title line from content if it exists
    let contenido = generatedLesson;
    const lines = generatedLesson.split('\n');
    if (lines[0].startsWith('# ')) {
      contenido = lines.slice(1).join('\n').trim();
    }

    try {
      const response = await fetch('http://localhost:5000/api/lecciones/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: lessonTitle,
          contenido,
          descripcion: `Lección generada automáticamente sobre ${selectedCharacter || customTopic}`,
          asignatura: 'Historia',
          nivel_dificultad: 'intermedio',
          tiempo_estimado: 30
        })
      });

      if (!response.ok) {
        throw new Error('Error al publicar la lección');
      }

      const data = await response.json();
      alert('Lección publicada exitosamente!');
      console.log('Lección creada:', data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar la lección. Verifica tu conexión.');
    }
  };

  const generateLesson = async () => {
    if (!selectedCharacter && !customTopic.trim()) {
      alert('Selecciona un personaje o ingresa un tema personalizado');
      return;
    }

    setIsGeneratingLesson(true);
    try {
      const response = await fetch('http://localhost:5000/api/ollama/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: selectedCharacter || undefined,
          topic: customTopic || undefined,
          progress: 50,
          userLevel: 1
        })
      });

      if (!response.ok) {
        throw new Error('Error generando lección');
      }

      const data = await response.json();
      setGeneratedLesson(data.lesson);

      // Parse title from the generated lesson
      const lines = data.lesson.split('\n');
      if (lines[0].startsWith('# ')) {
        setLessonTitle(lines[0].substring(2).trim());
      } else {
        setLessonTitle('Lección Generada por IA');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar la lección. Verifica que Ollama esté ejecutándose.');
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const generateChallenge = async () => {
    if (!challengeCharacter || !challengeTopic.trim()) {
      alert('Selecciona un personaje y coloca el tema del reto');
      return;
    }

    setIsGeneratingChallenge(true);
    try {
      const response = await fetch('http://localhost:5000/api/ollama/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: challengeCharacter,
          topic: challengeTopic,
          numQuestions: numQuestions,
          difficulty: challengeDifficulty
        })
      });

      if (!response.ok) {
        throw new Error('Error generando reto');
      }

      const data = await response.json();
      setGeneratedChallenge(data.challenge);
      setChallengeTitle(`Reto: ${challengeTopic}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el reto. Verifica que Ollama esté ejecutándose.');
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  return (
    <div className="min-h-full bg-brand-cream p-6 animate-scale-in overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <SparklesIcon className="h-8 w-8 text-brand-orange" />
              Generación Dinámica
            </h1>
            <p className="text-slate-600 mt-1">Genera lecciones y retos automáticamente con IA</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Generation Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpenIcon className="h-6 w-6 text-brand-orange" />
                Generar Lección
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Personaje Histórico (opcional)
                  </label>
                  <select
                    value={selectedCharacter}
                    onChange={(e) => setSelectedCharacter(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  >
                    <option value="">Seleccionar personaje...</option>
                    {characters.map(char => (
                      <option key={char.id} value={char.id}>
                        {char.avatar} {char.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tema Personalizado (opcional)
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Ej: La agricultura en el Imperio Inca"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  />
                </div>

                <button
                  onClick={generateLesson}
                  disabled={isGeneratingLesson}
                  className="w-full bg-brand-orange text-white font-semibold py-3 px-6 rounded-lg hover:bg-brand-red-orange transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeneratingLesson ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5" />
                      Generar Lección
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-brand-orange" />
                Generar Reto
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Personaje Histórico
                  </label>
                  <select
                    value={challengeCharacter}
                    onChange={(e) => setChallengeCharacter(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  >
                    <option value="">Seleccionar personaje...</option>
                    {characters.map(char => (
                      <option key={char.id} value={char.id}>
                        {char.avatar} {char.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tema del Reto
                  </label>
                  <input
                    type="text"
                    value={challengeTopic}
                    onChange={(e) => setChallengeTopic(e.target.value)}
                    placeholder="Ej: La conquista española"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cantidad de Preguntas
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  >
                    <option value={3}>3 preguntas</option>
                    <option value={5}>5 preguntas</option>
                    <option value={7}>7 preguntas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dificultad
                  </label>
                  <select
                    value={challengeDifficulty}
                    onChange={(e) => setChallengeDifficulty(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  >
                    <option value="fácil">Fácil</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="difícil">Difícil</option>
                  </select>
                </div>

                <button
                  onClick={generateChallenge}
                  disabled={isGeneratingChallenge}
                  className="w-full bg-brand-orange text-white font-semibold py-3 px-6 rounded-lg hover:bg-brand-red-orange transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeneratingChallenge ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <TrophyIcon className="h-5 w-5" />
                      Generar Reto
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated Content */}
          <div className="space-y-6">
            {generatedLesson && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BookOpenIcon className="h-6 w-6 text-green-600" />
                  Lección Generada
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título de la Lección
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="Ingresa el título de la lección..."
                  />
                </div>
                <textarea
                  value={generatedLesson}
                  onChange={(e) => setGeneratedLesson(e.target.value)}
                  className="w-full h-80 p-4 border border-gray-300 rounded-lg resize-vertical focus:ring-2 focus:ring-brand-orange focus:border-transparent text-sm leading-relaxed overflow-y-auto"
                  placeholder="La lección generada aparecerá aquí..."
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={publishLesson}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            )}

            {generatedChallenge && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <TrophyIcon className="h-6 w-6 text-blue-600" />
                    Constructor de Preguntas del Reto
                  </h3>
                  <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {challengeQuestions.length} preguntas
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título del Reto
                  </label>
                  <input
                    type="text"
                    value={challengeTitle}
                    onChange={(e) => setChallengeTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Ingresa el título del reto..."
                  />
                </div>

                <div className="space-y-3">
                  {challengeQuestions.map((q, index) => (
                    <div key={q.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-slate-800">
                          P{index + 1}: {q.questionText.substring(0, 50)}...
                        </p>
                        <p className="text-xs text-slate-500">
                          {q.options.length} opciones • {q.points} XP • Respuesta: {q.options.find((o: any) => o.id === q.correctOptionId)?.text}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="p-2 text-slate-600 hover:text-blue-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-slate-600 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddNewQuestion}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-400 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    <span>Agregar Pregunta</span>
                  </button>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={publishChallenge}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Publicar Reto
                  </button>
                </div>
              </div>
            )}

            {!generatedLesson && !generatedChallenge && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center py-12">
                <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  Genera contenido dinámico
                </h3>
                <p className="text-slate-500">
                  Selecciona un personaje o tema y genera lecciones y retos automáticamente con IA.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <QuestionEditorModal
          question={isEditingQuestion}
          onSave={handleSaveQuestion}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

// Question Editor Modal
const QuestionEditorModal: React.FC<{
  question: any | null;
  onSave: (question: any) => void;
  onClose: () => void;
}> = ({ question, onSave, onClose }) => {
  const [editedQuestion, setEditedQuestion] = useState<any | null>(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  if (!editedQuestion) return null;

  const handleSave = () => {
    if (editedQuestion.questionText.trim() === '' || editedQuestion.points <= 0) {
      alert('Por favor, completa el texto de la pregunta y los puntos.');
      return;
    }
    if (editedQuestion.options.length < 2) {
      alert('Agrega al menos 2 opciones para la pregunta de opción múltiple.');
      return;
    }
    if (!editedQuestion.correctOptionId) {
      alert('Selecciona la opción correcta.');
      return;
    }
    if (editedQuestion.options.some((opt: any) => opt.text.trim() === '')) {
      alert('Todas las opciones deben tener texto.');
      return;
    }
    onSave(editedQuestion);
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md animate-scale-in flex flex-col" style={{maxHeight: '90vh'}}>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {question?.id ? 'Editar' : 'Nueva'} Pregunta
        </h2>
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Texto de la Pregunta</label>
            <textarea
              rows={3}
              value={editedQuestion.questionText}
              onChange={e => setEditedQuestion({ ...editedQuestion, questionText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Puntos (XP)</label>
            <input
              type="number"
              value={editedQuestion.points}
              onChange={e => setEditedQuestion({ ...editedQuestion, points: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Opciones</label>
            {editedQuestion.options.map((option: any, index: number) => (
              <div key={option.id} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={editedQuestion.correctOptionId === option.id}
                  onChange={() => setEditedQuestion({ ...editedQuestion, correctOptionId: option.id })}
                  className="mr-2"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={e => {
                    const newOptions = [...editedQuestion.options];
                    newOptions[index] = { ...newOptions[index], text: e.target.value };
                    setEditedQuestion({ ...editedQuestion, options: newOptions });
                  }}
                  placeholder={`Opción ${index + 1}`}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => {
                    const newOptions = editedQuestion.options.filter((_: any, i: number) => i !== index);
                    setEditedQuestion({
                      ...editedQuestion,
                      options: newOptions,
                      correctOptionId: editedQuestion.correctOptionId === option.id ? '' : editedQuestion.correctOptionId
                    });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newOption = { id: `opt_${Date.now()}`, text: '' };
                setEditedQuestion({ ...editedQuestion, options: [...editedQuestion.options, newOption] });
              }}
              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-400 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <PlusCircleIcon className="h-4 w-4" />
              Agregar Opción
            </button>
          </div>
          {editedQuestion.correctOptionId === '' && editedQuestion.options.length > 0 && (
            <p className="text-sm text-red-500">Selecciona la opción correcta.</p>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 rounded-lg">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicGenerationPage;