import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import apiService from '../../services/api';

interface MultimediaFile {
  id: string;
  file: File;
  tipo: 'video' | 'audio' | 'imagen';
  url: string; // data URL for preview
  titulo: string;
  descripcion: string;
}

interface Lesson {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  imagen_url?: string;
  multimedia: MultimediaFile[];
  preguntas: Question[];
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'drag_drop' | 'true_false' | 'ordering';
  questionText: string;
  points: number;
  options?: { id: string; text: string }[];
  correctAnswer?: string;
  correctOptionId?: string;
  // For compatibility with API
  pregunta?: string;
  opciones?: string[];
  respuesta_correcta?: number | string;
}

// --- MOCK DATA ---
const emptyLesson: Lesson = {
  id: `lesson_${Date.now()}`,
  titulo: '',
  descripcion: '',
  contenido: '',
  imagen_url: '',
  multimedia: [],
  preguntas: [],
};

interface CreateLessonPageProps {
  onBack: () => void;
  lessonToEdit?: Lesson | null;
}

const CreateLessonPage: React.FC<CreateLessonPageProps> = ({ onBack, lessonToEdit }) => {
  const normalizeLesson = (lesson: Lesson | null | undefined): Lesson => {
    if (!lesson) return { ...emptyLesson, id: `lesson_${Date.now()}` };
    return {
      ...lesson,
      multimedia: lesson.multimedia || [],
      preguntas: (lesson.preguntas || []).map(p => {
        // Handle both old and new formats
        if (p.questionText) {
          // New format
          return {
            ...p,
            opciones: p.opciones || (p as any).options || []
          };
        } else {
          // Old format: convert pregunta to questionText, etc.
          return {
            id: p.id,
            type: 'multiple_choice', // Default
            questionText: (p as any).pregunta || '',
            points: 10,
            options: ((p as any).opciones || []).map((text: string, index: number) => ({
              id: `opt_${index}`,
              text
            })),
            correctOptionId: (p as any).opciones ? `opt_${(p as any).respuesta_correcta || 0}` : '',
            opciones: (p as any).opciones || []
          };
        }
      })
    };
  };

  const [lesson, setLesson] = useState<Lesson>(normalizeLesson(lessonToEdit));
  const [isEditingQuestion, setIsEditingQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  const handleUpdateField = (field: keyof Lesson, value: any) => {
    setLesson(prev => ({ ...prev, [field]: value }));
  };

  const handleMultimediaFiles = async (files: FileList) => {
    const multimediaFiles: MultimediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tipo = file.type.startsWith('video/') ? 'video' :
                   file.type.startsWith('audio/') ? 'audio' :
                   file.type.startsWith('image/') ? 'imagen' : 'imagen';

      // Convert to data URL for preview
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      multimediaFiles.push({
        id: `media_${Date.now()}_${i}`,
        file,
        tipo,
        url: dataUrl,
        titulo: file.name,
        descripcion: ''
      });
    }

    setLesson(prev => ({
      ...prev,
      multimedia: [...prev.multimedia, ...multimediaFiles]
    }));
  };

  const removeMultimedia = (id: string) => {
    setLesson(prev => ({
      ...prev,
      multimedia: prev.multimedia.filter(m => m.id !== id)
    }));
  };

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

  const handleEditQuestion = (question: Question) => {
    setIsEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      handleUpdateField('preguntas', lesson.preguntas.filter(q => q.id !== questionId));
    }
  };

  const handleSaveQuestion = (question: Question) => {
    // Validation
    if (!question.questionText.trim()) {
      alert('Ingresa el texto de la pregunta.');
      return;
    }
    if (question.type === 'multiple_choice') {
      if ((question.options || []).length < 2) {
        alert('Agrega al menos 2 opciones.');
        return;
      }
      if (!question.correctOptionId) {
        alert('Selecciona la opción correcta.');
        return;
      }
    } else if (question.type === 'fill_blank') {
      if (!question.correctAnswer?.trim()) {
        alert('Ingresa la respuesta correcta.');
        return;
      }
    }

    const existingIndex = lesson.preguntas.findIndex(q => q.id === question.id);
    if (existingIndex > -1) {
      const updatedQuestions = [...lesson.preguntas];
      updatedQuestions[existingIndex] = question;
      handleUpdateField('preguntas', updatedQuestions);
    } else {
      handleUpdateField('preguntas', [...lesson.preguntas, question]);
    }
    setIsModalOpen(false);
    setIsEditingQuestion(null);
  };

  const handleSaveLesson = async () => {
    if (!lesson.titulo.trim()) {
      alert('Ingresa un título para la lección.');
      return;
    }
    if (!lesson.contenido.trim()) {
      alert('Ingresa el contenido de la lección.');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        titulo: lesson.titulo,
        descripcion: lesson.descripcion,
        contenido: lesson.contenido,
        imagen_url: lesson.imagen_url,
        multimedia: lesson.multimedia.map(m => ({
          id: m.id,
          tipo: m.tipo,
          url: m.url, // For now, data URL. Backend will replace with real URL
          titulo: m.titulo,
          descripcion: m.descripcion
        })),
        preguntas: lesson.preguntas.map(q => {
          if (q.type === 'multiple_choice') {
            return {
              pregunta: q.questionText,
              opciones: (q.options || []).map(opt => opt.text),
              respuesta_correcta: (q.options || []).findIndex(opt => opt.id === q.correctOptionId),
            };
          } else if (q.type === 'fill_blank') {
            return {
              pregunta: q.questionText,
              opciones: [q.correctAnswer || ''],
              respuesta_correcta: 0,
            };
          } else {
            // For other types, not supported yet
            return {
              pregunta: q.questionText,
              opciones: [],
              respuesta_correcta: 0,
            };
          }
        }),
      };

      if (lessonToEdit) {
        await apiService.actualizarLeccion(parseInt(lesson.id), data);
        alert('Lección actualizada exitosamente.');
      } else {
        await apiService.crearLeccion(data);
        alert('Lección creada exitosamente.');
      }
      onBack();
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Error al guardar la lección.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-cream animate-scale-in">
      <header className="p-4 bg-brand-offwhite shadow-sm flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors text-base mr-4">
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Volver</span>
        </button>
        <h1 className="text-xl font-bold text-center text-slate-800 flex-1">{lessonToEdit ? 'Editar Lección' : 'Crear Nueva Lección'}</h1>
      </header>

      <div className="p-4 space-y-6">
        <Card>
          <h2 className="text-lg font-bold text-slate-700 mb-3">Información General</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Título de la Lección</label>
              <input
                type="text"
                value={lesson.titulo}
                onChange={e => handleUpdateField('titulo', e.target.value)}
                placeholder="Ej: La Conquista del Tahuantinsuyo"
                className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Descripción</label>
              <textarea
                rows={3}
                value={lesson.descripcion}
                onChange={e => handleUpdateField('descripcion', e.target.value)}
                placeholder="Breve descripción de la lección"
                className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Subir contenido multimedia</label>
              <input
                type="file"
                accept="video/*,audio/*,image/*"
                multiple
                onChange={(e) => e.target.files && handleMultimediaFiles(e.target.files)}
                className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-white hover:file:bg-brand-red-orange"
              />
              <p className="text-xs text-slate-500 mt-1">Puedes subir videos, audios e imágenes para enriquecer la lección (máx. 10MB por archivo)</p>

              {lesson.multimedia.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Archivos seleccionados:</h4>
                  {lesson.multimedia.map((media) => (
                    <div key={media.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          media.tipo === 'video' ? 'bg-red-100 text-red-800' :
                          media.tipo === 'audio' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {media.tipo}
                        </span>
                        <span className="text-sm text-slate-700">{media.titulo}</span>
                      </div>
                      <button
                        onClick={() => removeMultimedia(media.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Imagen de la Lección</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const dataUrl = e.target?.result as string;
                      handleUpdateField('imagen_url', dataUrl);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-white hover:file:bg-brand-red-orange"
              />
              {lesson.imagen_url && (
                <div className="mt-3 flex items-center space-x-3">
                  <img src={lesson.imagen_url} alt="Preview" className="w-24 h-16 rounded-lg object-cover" />
                  <span className="text-sm text-slate-600">Vista previa</span>
                </div>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-700 mb-3">Contenido de la Lección</h2>
          <textarea
            rows={10}
            value={lesson.contenido}
            onChange={e => handleUpdateField('contenido', e.target.value)}
            placeholder="Escribe el contenido completo de la lección aquí..."
            className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
          />
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-slate-700">Preguntas de Evaluación (Opcional)</h2>
            <span className="text-sm font-semibold bg-brand-cream text-slate-600 px-3 py-1 rounded-full">{lesson.preguntas.length} preguntas</span>
          </div>

          <div className="space-y-3">
            {lesson.preguntas.map((q, index) => (
              <div key={q.id} className="bg-brand-cream p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-slate-800">P{index + 1}: {q.questionText.substring(0, 30)}...</p>
                  <p className="text-xs text-slate-500 uppercase font-semibold">
                    {q.type === 'multiple_choice' ? `${(q.options || []).length} opciones` :
                     q.type === 'fill_blank' ? 'Completar espacio' :
                     q.type.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditQuestion(q)} className="p-2 text-slate-600 hover:text-brand-orange">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-slate-600 hover:text-red-500">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleAddNewQuestion} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-400 text-slate-600 font-semibold rounded-lg hover:bg-brand-yellow-orange hover:border-brand-orange transition-colors">
              <PlusCircleIcon className="h-5 w-5" />
              <span>Agregar Pregunta</span>
            </button>
          </div>
        </Card>

        <div className="p-4">
          <button
            onClick={handleSaveLesson}
            disabled={isSaving}
            className="w-full bg-brand-red-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-orange transform hover:-translate-y-1 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Guardando...' : (lessonToEdit ? 'Guardar Cambios' : 'Crear Lección')}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-30 backdrop-blur-sm">
          <div className="bg-brand-offwhite rounded-2xl p-6 shadow-xl w-full max-w-sm animate-scale-in flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{isEditingQuestion?.id ? 'Editar' : 'Nueva'} Pregunta</h2>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Pregunta</label>
                <select
                  value={isEditingQuestion?.type || 'multiple_choice'}
                  onChange={e => {
                    const newType = e.target.value as Question['type'];
                    if (newType === 'multiple_choice') {
                      setIsEditingQuestion({
                        id: isEditingQuestion?.id || `q_${Date.now()}`,
                        type: 'multiple_choice',
                        questionText: isEditingQuestion?.questionText || '',
                        points: isEditingQuestion?.points || 10,
                        options: [],
                        correctOptionId: '',
                      });
                    } else if (newType === 'fill_blank') {
                      setIsEditingQuestion({
                        id: isEditingQuestion?.id || `q_${Date.now()}`,
                        type: 'fill_blank',
                        questionText: isEditingQuestion?.questionText || '',
                        points: isEditingQuestion?.points || 10,
                        correctAnswer: '',
                      });
                    } else {
                      setIsEditingQuestion(prev => prev ? { ...prev, type: newType } : null);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-brand-cream appearance-none"
                >
                  <option value="multiple_choice">Opción Múltiple</option>
                  <option value="fill_blank">Completar Espacio</option>
                  <option value="drag_drop">Arrastrar y Soltar</option>
                  <option value="true_false">Verdadero / Falso</option>
                  <option value="ordering">Ordenar Secuencia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Texto de la Pregunta</label>
                <textarea
                  rows={3}
                  value={isEditingQuestion?.questionText || ''}
                  onChange={e => setIsEditingQuestion(prev => prev ? { ...prev, questionText: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-lg bg-brand-cream"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Puntos (XP)</label>
                <input
                  type="number"
                  value={isEditingQuestion?.points || 10}
                  onChange={e => setIsEditingQuestion(prev => prev ? { ...prev, points: parseInt(e.target.value) || 0 } : null)}
                  className="w-full px-3 py-2 rounded-lg bg-brand-cream"
                />
              </div>
              {isEditingQuestion?.type === 'multiple_choice' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Opciones</label>
                    {(isEditingQuestion.options || []).map((option, index) => (
                      <div key={option.id} className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={isEditingQuestion.correctOptionId === option.id}
                          onChange={() => setIsEditingQuestion(prev => prev ? { ...prev, correctOptionId: option.id } : null)}
                          className="mr-2"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={e => {
                            const newOptions = [...(isEditingQuestion.options || [])];
                            newOptions[index] = { ...newOptions[index], text: e.target.value };
                            setIsEditingQuestion(prev => prev ? { ...prev, options: newOptions } : null);
                          }}
                          placeholder={`Opción ${index + 1}`}
                          className="flex-1 px-3 py-2 rounded-lg bg-brand-cream"
                        />
                        <button
                          onClick={() => {
                            const newOptions = (isEditingQuestion.options || []).filter((_, i) => i !== index);
                            setIsEditingQuestion(prev => prev ? { ...prev, options: newOptions, correctOptionId: prev.correctOptionId === option.id ? '' : prev.correctOptionId } : null);
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
                        setIsEditingQuestion(prev => prev ? { ...prev, options: [...(prev.options || []), newOption] } : null);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-400 text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <PlusCircleIcon className="h-4 w-4" />
                      Agregar Opción
                    </button>
                  </div>
                  {(!isEditingQuestion.correctOptionId || (isEditingQuestion.options || []).length === 0) && (
                    <p className="text-sm text-red-500">Agrega opciones y selecciona la correcta.</p>
                  )}
                </div>
              )}
              {isEditingQuestion?.type === 'fill_blank' && (
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Respuesta Correcta</label>
                  <input
                    type="text"
                    value={isEditingQuestion.correctAnswer || ''}
                    onChange={e => setIsEditingQuestion(prev => prev ? { ...prev, correctAnswer: e.target.value } : null)}
                    className="w-full px-3 py-2 rounded-lg bg-brand-cream"
                    placeholder="Ingresa la respuesta correcta"
                  />
                </div>
              )}
              {isEditingQuestion?.type && !['multiple_choice', 'fill_blank'].includes(isEditingQuestion.type) && (
                <p className="text-sm text-slate-500 text-center p-4 bg-brand-cream rounded-lg">Editor para este tipo de pregunta no implementado aún.</p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 rounded-lg">
                Cancelar
              </button>
              <button onClick={() => isEditingQuestion && handleSaveQuestion(isEditingQuestion)} className="flex-1 bg-brand-red-orange text-white font-bold py-3 rounded-lg">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLessonPage;