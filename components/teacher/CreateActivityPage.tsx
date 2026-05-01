import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { Activity, Question, QuestionType, MultipleChoiceQuestion, FillBlankQuestion, DragDropQuestion } from '../../types';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import apiService from '../../services/api';

// --- MOCK DATA ---
const emptyActivity: Activity = {
    id: `act_${Date.now()}`,
    title: '',
    description: '',
    type: 'Cuestionario',
    dueDate: '',
    xp: 100,
    maxAttempts: 1,
    questions: [],
};

// --- SUB-COMPONENT: QUESTION EDITOR MODAL ---
const QuestionEditorModal: React.FC<{
    question: Question | null;
    onSave: (question: Question) => void;
    onClose: () => void;
}> = ({ question, onSave, onClose }) => {
    const [editedQuestion, setEditedQuestion] = useState<Question | null>(question);

    if (!editedQuestion) return null;

    const handleSave = () => {
        // Basic validation
        if (editedQuestion.questionText.trim() === '' || editedQuestion.points <= 0) {
            alert('Por favor, completa el texto de la pregunta y los puntos.');
            return;
        }
        if (editedQuestion.type === 'multiple_choice') {
            const mcQ = editedQuestion as MultipleChoiceQuestion;
            if (mcQ.options.length < 2) {
                alert('Agrega al menos 2 opciones para la pregunta de opción múltiple.');
                return;
            }
            if (!mcQ.correctOptionId) {
                alert('Selecciona la opción correcta.');
                return;
            }
            if (mcQ.options.some(opt => opt.text.trim() === '')) {
                alert('Todas las opciones deben tener texto.');
                return;
            }
        } else if (editedQuestion.type === 'fill_blank') {
            const fbQ = editedQuestion as FillBlankQuestion;
            if (fbQ.correctAnswer.trim() === '') {
                alert('Ingresa la respuesta correcta para completar el espacio.');
                return;
            }
        } else if (editedQuestion.type === 'drag_drop') {
            const ddQ = editedQuestion as DragDropQuestion;
            if (ddQ.draggableItems.length === 0) {
                alert('Agrega al menos un elemento arrastrable.');
                return;
            }
            if (ddQ.dropZones.length === 0) {
                alert('Agrega al menos una zona de destino.');
                return;
            }
            if (ddQ.dropZones.some(z => !z.elemento_correcto_id)) {
                alert('Asigna elementos correctos a todas las zonas de destino.');
                return;
            }
        }
        onSave(editedQuestion);
    };

    const renderEditorFields = () => {
        switch (editedQuestion.type) {
            case 'multiple_choice':
                const mcQuestion = editedQuestion as MultipleChoiceQuestion;
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Opciones</label>
                            {mcQuestion.options.map((option, index) => (
                                <div key={option.id} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="radio"
                                        name="correctOption"
                                        checked={mcQuestion.correctOptionId === option.id}
                                        onChange={() => setEditedQuestion({ ...mcQuestion, correctOptionId: option.id })}
                                        className="mr-2"
                                    />
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={e => {
                                            const newOptions = [...mcQuestion.options];
                                            newOptions[index] = { ...newOptions[index], text: e.target.value };
                                            setEditedQuestion({ ...mcQuestion, options: newOptions });
                                        }}
                                        placeholder={`Opción ${index + 1}`}
                                        className="flex-1 px-3 py-2 rounded-lg bg-brand-cream"
                                    />
                                    <button
                                        onClick={() => {
                                            const newOptions = mcQuestion.options.filter((_, i) => i !== index);
                                            setEditedQuestion({ ...mcQuestion, options: newOptions, correctOptionId: mcQuestion.correctOptionId === option.id ? '' : mcQuestion.correctOptionId });
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
                                    setEditedQuestion({ ...mcQuestion, options: [...mcQuestion.options, newOption] });
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-400 text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <PlusCircleIcon className="h-4 w-4" />
                                Agregar Opción
                            </button>
                        </div>
                        {mcQuestion.correctOptionId === '' && mcQuestion.options.length > 0 && (
                            <p className="text-sm text-red-500">Selecciona la opción correcta.</p>
                        )}
                    </div>
                );
            case 'fill_blank':
                const fbQuestion = editedQuestion as FillBlankQuestion;
                return (
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Respuesta Correcta</label>
                        <input
                            type="text"
                            value={fbQuestion.correctAnswer}
                            onChange={e => setEditedQuestion({ ...fbQuestion, correctAnswer: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-brand-cream"
                            placeholder="Ingresa la respuesta correcta"
                        />
                    </div>
                );
            case 'drag_drop':
                const ddQuestion = editedQuestion as DragDropQuestion;
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Elementos Arrastrables</label>
                            {ddQuestion.draggableItems.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={item.text}
                                        onChange={e => {
                                            const newItems = [...ddQuestion.draggableItems];
                                            newItems[index] = { ...newItems[index], text: e.target.value };
                                            setEditedQuestion({ ...ddQuestion, draggableItems: newItems } as DragDropQuestion);
                                        }}
                                        placeholder={`Elemento ${index + 1}`}
                                        className="flex-1 px-3 py-2 rounded-lg bg-brand-cream"
                                    />
                                    <button
                                        onClick={() => {
                                            const newItems = ddQuestion.draggableItems.filter((_, i) => i !== index);
                                            setEditedQuestion({ ...ddQuestion, draggableItems: newItems } as DragDropQuestion);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    const newItem = { id: `drag_${Date.now()}`, text: '' };
                                    setEditedQuestion({ ...ddQuestion, draggableItems: [...ddQuestion.draggableItems, newItem] } as DragDropQuestion);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-400 text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <PlusCircleIcon className="h-4 w-4" />
                                Agregar Elemento
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Zonas de Destino</label>
                            {ddQuestion.dropZones.map((zone, index) => (
                                <div key={zone.id} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={zone.label}
                                        onChange={e => {
                                            const newZones = [...ddQuestion.dropZones];
                                            newZones[index] = { ...newZones[index], label: e.target.value };
                                            setEditedQuestion({ ...ddQuestion, dropZones: newZones } as DragDropQuestion);
                                        }}
                                        placeholder={`Zona ${index + 1}`}
                                        className="flex-1 px-3 py-2 rounded-lg bg-brand-cream"
                                    />
                                    <select
                                        value={zone.elemento_correcto_id}
                                        onChange={e => {
                                            const newZones = [...ddQuestion.dropZones];
                                            newZones[index] = { ...newZones[index], elemento_correcto_id: e.target.value };
                                            setEditedQuestion({ ...ddQuestion, dropZones: newZones } as DragDropQuestion);
                                        }}
                                        className="px-3 py-2 rounded-lg bg-brand-cream"
                                    >
                                        <option value="">Seleccionar elemento</option>
                                        {ddQuestion.draggableItems.map(item => (
                                            <option key={item.id} value={item.id}>{item.text}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            const newZones = ddQuestion.dropZones.filter((_, i) => i !== index);
                                            setEditedQuestion({ ...ddQuestion, dropZones: newZones } as DragDropQuestion);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    const newZone = { id: `drop_${Date.now()}`, label: '', correctItemId: '' };
                                    setEditedQuestion({ ...ddQuestion, dropZones: [...ddQuestion.dropZones, newZone] } as DragDropQuestion);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-400 text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <PlusCircleIcon className="h-4 w-4" />
                                Agregar Zona
                            </button>
                        </div>
                        {ddQuestion.draggableItems.length === 0 && <p className="text-sm text-red-500">Agrega al menos un elemento arrastrable.</p>}
                        {ddQuestion.dropZones.length === 0 && <p className="text-sm text-red-500">Agrega al menos una zona de destino.</p>}
                        {ddQuestion.dropZones.some(z => !z.elemento_correcto_id) && <p className="text-sm text-red-500">Asigna elementos correctos a todas las zonas.</p>}
                    </div>
                );
            // Add other question type editors here...
            default:
                return <p className="text-sm text-slate-500 text-center p-4 bg-brand-cream rounded-lg">Editor para este tipo de pregunta no implementado aún.</p>;
        }
    }

    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-30 backdrop-blur-sm">
            <div className="bg-brand-offwhite rounded-2xl p-6 shadow-xl w-full max-w-sm animate-scale-in flex flex-col" style={{maxHeight: '90vh'}}>
                <h2 className="text-xl font-bold text-slate-800 mb-4">{question?.id ? 'Editar' : 'Nueva'} Pregunta</h2>
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Pregunta</label>
                        <select
                            value={editedQuestion.type}
                            onChange={e => {
                                const newType = e.target.value as QuestionType;
                                if (newType === 'multiple_choice') {
                                    setEditedQuestion({
                                        id: editedQuestion.id,
                                        type: 'multiple_choice',
                                        questionText: editedQuestion.questionText,
                                        points: editedQuestion.points,
                                        options: [],
                                        correctOptionId: '',
                                    } as MultipleChoiceQuestion);
                                } else if (newType === 'fill_blank') {
                                    setEditedQuestion({
                                        id: editedQuestion.id,
                                        type: 'fill_blank',
                                        questionText: editedQuestion.questionText,
                                        points: editedQuestion.points,
                                        correctAnswer: '',
                                    } as FillBlankQuestion);
                                } else if (newType === 'drag_drop') {
                                    setEditedQuestion({
                                        id: editedQuestion.id,
                                        type: 'drag_drop',
                                        questionText: editedQuestion.questionText,
                                        points: editedQuestion.points,
                                        draggableItems: [],
                                        dropZones: [],
                                    } as DragDropQuestion);
                                } else {
                                    // For other types, keep as is or handle
                                    setEditedQuestion({ ...editedQuestion, type: newType } as Question);
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
                            value={editedQuestion.questionText}
                            onChange={e => setEditedQuestion({ ...editedQuestion, questionText: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-brand-cream"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Puntos (XP)</label>
                        <input
                            type="number"
                            value={editedQuestion.points}
                            onChange={e => setEditedQuestion({ ...editedQuestion, points: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-brand-cream"
                        />
                    </div>
                    {renderEditorFields()}
                </div>
                <div className="mt-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 rounded-lg">Cancelar</button>
                    <button onClick={handleSave} className="flex-1 bg-brand-red-orange text-white font-bold py-3 rounded-lg">Guardar</button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT: CREATE / EDIT ACTIVITY PAGE ---
interface CreateActivityPageProps {
    onBack: () => void;
    activityToEdit?: Activity | null;
}

const CreateActivityPage: React.FC<CreateActivityPageProps> = ({ onBack, activityToEdit }) => {
    const [activity, setActivity] = useState<Activity>(activityToEdit || emptyActivity);
    const [isEditingQuestion, setIsEditingQuestion] = useState<Question | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setActivity(activityToEdit || { ...emptyActivity, id: `act_${Date.now()}`});
    }, [activityToEdit]);

    const handleUpdateField = (field: keyof Activity, value: any) => {
        setActivity(prev => ({ ...prev, [field]: value }));
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
        if(confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
            handleUpdateField('questions', activity.questions.filter(q => q.id !== questionId));
        }
    };
    
    const handleSaveQuestion = (question: Question) => {
        const existingIndex = activity.questions.findIndex(q => q.id === question.id);
        if (existingIndex > -1) {
            const updatedQuestions = [...activity.questions];
            updatedQuestions[existingIndex] = question;
            handleUpdateField('questions', updatedQuestions);
        } else {
            handleUpdateField('questions', [...activity.questions, question]);
        }
        setIsModalOpen(false);
        setIsEditingQuestion(null);
    };

    const mapQuestionsToApi = (questions: Question[]) => {
        return questions.map(q => {
            if (q.type === 'multiple_choice') {
                const mcQ = q as MultipleChoiceQuestion;
                return {
                    pregunta: q.questionText,
                    opciones: mcQ.options.map(o => o.text),
                    respuesta_correcta: mcQ.options.findIndex(o => o.id === mcQ.correctOptionId)
                };
            } else if (q.type === 'fill_blank') {
                const fbQ = q as FillBlankQuestion;
                return {
                    pregunta: q.questionText,
                    opciones: [fbQ.correctAnswer],
                    respuesta_correcta: 0
                };
            } else if (q.type === 'drag_drop') {
                const ddQ = q as DragDropQuestion;
                return {
                    pregunta: q.questionText,
                    tipo: 'drag_drop',
                    elementos_arrastrables: ddQ.draggableItems,
                    zonas_destino: ddQ.dropZones,
                    opciones: [],
                    respuesta_correcta: 0
                };
            } else {
                // For other types, skip or handle
                return null;
            }
        }).filter(Boolean);
    };

    const handleSaveActivity = async () => {
        if (activity.questions.length === 0) {
            alert('Agrega al menos una pregunta al reto.');
            return;
        }
        if (!activity.title.trim()) {
            alert('Ingresa un título para el reto.');
            return;
        }
        if (!activity.dueDate) {
            alert('Selecciona una fecha de entrega.');
            return;
        }

        setIsSaving(true);
        try {
            const tipo = activity.type === 'Cuestionario' ? 'individual' : 'competition';
            const preguntas = mapQuestionsToApi(activity.questions);
            await apiService.crearReto({
                titulo: activity.title,
                descripcion: activity.description || '',
                tipo,
                xp_recompensa: activity.xp,
                fecha_fin: activity.dueDate,
                max_intentos: activity.maxAttempts,
                preguntas
            });
            alert('Reto creado exitosamente.');
            onBack();
        } catch (error) {
            console.error('Error creando reto:', error);
            alert('Error al crear el reto. Inténtalo de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-brand-cream animate-scale-in">
            <header className="p-4 bg-brand-offwhite shadow-sm flex items-center sticky top-0 z-10">
                <button onClick={onBack} className="lg:hidden flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors text-base mr-4">
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Volver</span>
                </button>
                <h1 className="text-xl font-bold text-center text-slate-800 flex-1">{activityToEdit ? 'Editar Reto' : 'Crear Nuevo Reto'}</h1>
            </header>

            <div className="p-4 space-y-6">
                <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Información General</h2>
                    <form className="space-y-4">
                         <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Título del Reto</label>
                            <input type="text" value={activity.title} onChange={e => handleUpdateField('title', e.target.value)} placeholder="Ej: La Conquista del Tahuantinsuyo" className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Tipo de Actividad</label>
                            <select value={activity.type} onChange={e => handleUpdateField('type', e.target.value)} className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none appearance-none">
                                <option>Cuestionario</option>
                                <option>Competencia en tiempo real</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Fecha de Entrega</label>
                                <input type="date" value={activity.dueDate} onChange={e => handleUpdateField('dueDate', e.target.value)} className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"/>
                             </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Puntos (XP)</label>
                                <input type="number" value={activity.xp} onChange={e => handleUpdateField('xp', parseInt(e.target.value))} placeholder="Ej: 100" className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"/>
                             </div>
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">Máximo de Intentos</label>
                            <input type="number" value={activity.maxAttempts} onChange={e => handleUpdateField('maxAttempts', parseInt(e.target.value) || 1)} min="1" placeholder="Ej: 1" className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"/>
                         </div>
                    </form>
                </Card>

                <Card>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-slate-700">Constructor de Preguntas</h2>
                        <span className="text-sm font-semibold bg-brand-cream text-slate-600 px-3 py-1 rounded-full">{activity.questions.length} preguntas</span>
                    </div>

                    <div className="space-y-3">
                        {activity.questions.map((q, index) => (
                            <div key={q.id} className="bg-brand-cream p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-slate-800">P{index + 1}: {q.questionText.substring(0, 30)}...</p>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">{q.type.replace('_', ' ')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditQuestion(q)} className="p-2 text-slate-600 hover:text-brand-orange"><PencilIcon className="h-4 w-4"/></button>
                                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-slate-600 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
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
                        onClick={handleSaveActivity}
                        disabled={isSaving}
                        className="w-full bg-brand-red-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-orange transform hover:-translate-y-1 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {isSaving ? 'Guardando...' : (activityToEdit ? 'Guardar Cambios' : 'Asignar Reto a la Clase')}
                    </button>
                </div>
            </div>
            {isModalOpen && <QuestionEditorModal question={isEditingQuestion} onSave={handleSaveQuestion} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default CreateActivityPage;
