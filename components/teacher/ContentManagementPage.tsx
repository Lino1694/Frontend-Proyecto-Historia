import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { Activity } from '../../types';
import apiService from '../../services/api';

// Mock data, in a real app this would come from an API
const mockActivities: Activity[] = [
    {
        id: 'act_1',
        title: 'Linajes del Perú Colonial',
        type: 'Cuestionario',
        description: '',
        dueDate: '',
        xp: 150,
        maxAttempts: 1,
        questions: [{ id: 'q1', type: 'multiple_choice', questionText: '...', points: 10, options: [], correctOptionId: '' }]
    },
    {
        id: 'act_2',
        title: 'Línea de tiempo Incanas',
        type: 'Línea de Tiempo',
        description: '',
        dueDate: '',
        xp: 120,
        maxAttempts: 1,
        questions: []
    },
    {
        id: 'act_3',
        title: 'La rebelión de Túpac Amaru II',
        type: 'Cuestionario',
        description: '',
        dueDate: '',
        xp: 200,
        maxAttempts: 1,
        questions: []
    },
];

interface ContentManagementPageProps {
    onBack: () => void;
    onCreateNew: () => void;
    onEdit: (activity: Activity) => void;
    onCreateLesson: () => void;
    onEditLesson: (lesson: any) => void;
}

interface Student {
    id: number;
    nombre: string;
    avatar_url?: string;
}

const AssignmentModal: React.FC<{
    lesson: any;
    students: Student[];
    onClose: () => void;
    onAssign: (data: {
        tipo_asignacion: 'estudiantes' | 'grupo';
        estudiantes_ids?: number[];
        titulo_personalizado?: string;
        fecha_vencimiento?: string;
    }) => void;
}> = ({ lesson, students, onClose, onAssign }) => {
    const [tipoAsignacion, setTipoAsignacion] = useState<'estudiantes' | 'grupo'>('estudiantes');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [tituloPersonalizado, setTituloPersonalizado] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');

    const handleAssign = () => {
        onAssign({
            tipo_asignacion: tipoAsignacion,
            estudiantes_ids: tipoAsignacion === 'estudiantes' ? selectedStudents : undefined,
            titulo_personalizado: tituloPersonalizado || undefined,
            fecha_vencimiento: fechaVencimiento || undefined
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="p-4 border-b border-brand-cream">
                    <h3 className="text-lg font-bold text-slate-800">Asignar Lección</h3>
                    <p className="text-sm text-slate-600 mt-1">{lesson.titulo}</p>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Asignación</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTipoAsignacion('estudiantes')}
                                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm ${tipoAsignacion === 'estudiantes' ? 'bg-brand-orange text-white' : 'bg-brand-cream text-slate-700'}`}
                            >
                                Estudiantes
                            </button>
                            <button
                                onClick={() => setTipoAsignacion('grupo')}
                                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm ${tipoAsignacion === 'grupo' ? 'bg-brand-orange text-white' : 'bg-brand-cream text-slate-700'}`}
                            >
                                Grupo
                            </button>
                        </div>
                    </div>

                    {tipoAsignacion === 'estudiantes' && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Seleccionar Estudiantes</label>
                            <div className="max-h-40 overflow-y-auto space-y-1 border border-brand-cream rounded-lg p-2">
                                {students.length > 0 ? students.map(student => (
                                    <label key={student.id} className="flex items-center gap-2 p-2 hover:bg-brand-cream/50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedStudents([...selectedStudents, student.id]);
                                                } else {
                                                    setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                                }
                                            }}
                                            className="w-4 h-4 text-brand-orange"
                                        />
                                        <span className="text-sm text-slate-700">{student.nombre}</span>
                                    </label>
                                )) : (
                                    <p className="text-sm text-slate-500 p-2">No hay estudiantes disponibles</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Título Personalizado (opcional)</label>
                        <input
                            type="text"
                            value={tituloPersonalizado}
                            onChange={(e) => setTituloPersonalizado(e.target.value)}
                            placeholder="Ej: Lección para análisis histórico"
                            className="w-full px-3 py-2 rounded-lg bg-brand-offwhite border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha de Vencimiento (opcional)</label>
                        <input
                            type="date"
                            value={fechaVencimiento}
                            onChange={(e) => setFechaVencimiento(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-brand-offwhite border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-brand-cream flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 rounded-lg bg-brand-cream text-slate-700 font-semibold hover:bg-brand-cream/70"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={tipoAsignacion === 'estudiantes' && selectedStudents.length === 0}
                        className="flex-1 py-2 px-4 rounded-lg bg-brand-orange text-white font-semibold hover:bg-brand-red-orange disabled:opacity-50"
                    >
                        Asignar
                    </button>
                </div>
            </div>
        </div>
    );
};

const ContentManagementPage: React.FC<ContentManagementPageProps> = ({ onBack, onCreateNew, onEdit, onCreateLesson, onEditLesson }) => {
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [assignmentModal, setAssignmentModal] = useState<{ show: boolean; lesson: any | null }>({ show: false, lesson: null });
    const [showSuccess, setShowSuccess] = useState(false);

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

        const fetchStudents = async () => {
            try {
                const data = await apiService.obtenerProgresoEstudiantes();
                const studentsList = data.map((s: any) => ({
                    id: s.id,
                    nombre: s.nombre,
                    avatar_url: s.avatar_url
                }));
                setStudents(studentsList);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
        fetchStudents();
    }, []);

    const handleAssignLesson = async (data: {
        tipo_asignacion: 'estudiantes' | 'grupo';
        estudiantes_ids?: number[];
        titulo_personalizado?: string;
        fecha_vencimiento?: string;
    }) => {
        if (!assignmentModal.lesson) return;

        try {
            await apiService.asignarLeccion({
                leccion_id: assignmentModal.lesson.id,
                tipo_asignacion: data.tipo_asignacion,
                estudiantes_ids: data.estudiantes_ids,
                titulo_personalizado: data.titulo_personalizado,
                fecha_vencimiento: data.fecha_vencimiento
            });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error assigning lesson:', error);
            alert('Error al asignar la lección');
        }
    };

    return (
        <div className="flex flex-col h-full bg-brand-cream animate-scale-in">
            <header className="p-4 bg-brand-offwhite shadow-sm flex items-center justify-center sticky top-0 z-10 relative">
                 <button onClick={onBack} className="lg:hidden absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors text-base">
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Volver</span>
                </button>
                <h1 className="text-xl font-bold text-center text-slate-800">Gestión de Contenido</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {showSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                        Lección asignada exitosamente
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <button
                            onClick={onCreateNew}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-orange/20 text-brand-orange font-bold rounded-lg hover:bg-brand-orange/30 transition-colors">
                            <PlusCircleIcon className="h-6 w-6"/>
                            <span>Crear Nuevo Reto</span>
                        </button>
                    </Card>
                    <Card>
                        <button
                            onClick={onCreateLesson}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-blue/20 text-brand-blue font-bold rounded-lg hover:bg-brand-blue/30 transition-colors">
                            <PlusCircleIcon className="h-6 w-6"/>
                            <span>Crear Nueva Lección</span>
                        </button>
                    </Card>
                </div>

                <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Lecciones Creadas</h2>
                    {loading ? (
                        <p className="text-center text-slate-600">Cargando lecciones...</p>
                    ) : lessons.length > 0 ? (
                        <div className="space-y-3">
                            {lessons.map((lesson) => (
                                <div key={lesson.id} className="bg-brand-cream p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{lesson.titulo}</h3>
                                        <p className="text-sm text-slate-600">{lesson.descripcion}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setAssignmentModal({ show: true, lesson })}
                                            className="p-2 text-slate-600 hover:text-brand-blue"
                                            title="Asignar a estudiantes"
                                        >
                                            <UsersIcon className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => onEditLesson(lesson)} className="p-2 text-slate-600 hover:text-brand-orange">
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-600">No hay lecciones creadas aún.</p>
                    )}
                </Card>

                <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Retos Existentes</h2>
                    <div className="space-y-3">
                        {mockActivities.map(activity => (
                             <div key={activity.id} className="bg-brand-cream p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-800">{activity.title}</h3>
                                    <p className="text-xs text-slate-600">{activity.type} • {activity.xp} XP</p>
                                </div>
                                <button onClick={() => onEdit(activity)} className="flex items-center gap-2 font-semibold py-1.5 px-3 rounded-lg bg-brand-yellow-orange text-slate-800 hover:bg-brand-light-orange transition-colors text-sm">
                                    <PencilIcon className="h-4 w-4"/>
                                    <span>Editar</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {assignmentModal.show && assignmentModal.lesson && (
                <AssignmentModal
                    lesson={assignmentModal.lesson}
                    students={students}
                    onClose={() => setAssignmentModal({ show: false, lesson: null })}
                    onAssign={handleAssignLesson}
                />
            )}
        </div>
    );
};

export default ContentManagementPage;
