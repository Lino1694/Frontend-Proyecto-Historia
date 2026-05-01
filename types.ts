export type Role = 'student' | 'teacher' | 'moderator';

// Roles que se muestran en el login (sin moderador)
export type LoginRole = 'student' | 'teacher';

export interface Lesson {
    id: number;
    title: string;
    topic: string;
    difficulty: 'Fácil' | 'Intermedio' | 'Difícil';
    progress: number;
    xp: number;
    completed?:boolean;
    current_question_id?:number;
}

export interface StudentProgress {
    name: string;
    avatarUrl: string;
    progress: number;
}

export interface PendingActivity {
    id: number;
    title: string;
    type: 'Cuestionario' | 'Mapa';
    submissions: number;
    dueDate: string;
    priority: boolean;
}

// --- TIPOS DE PREGUNTAS Y DATOS DE ACTIVIDAD ---

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'drag_drop' | 'true_false' | 'ordering';

export interface BaseQuestion {
    id: string;
    type: QuestionType;
    questionText: string;
    points: number;
    hint?: string;
    image?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'multiple_choice';
    options: { id: string; text: string }[];
    correctOptionId: string;
    explanation?: string;
}

export interface FillBlankQuestion extends BaseQuestion {
    type: 'fill_blank';
    correctAnswer: string;
    explanation?: string;
}

export interface DragDropQuestion extends BaseQuestion {
  type: 'drag_drop';
  draggableItems: { id: string; text: string }[];
  dropZones: { id: string; label: string; elemento_correcto_id: string }[];
  explanation?: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
    type: 'true_false';
    correctAnswer: boolean;
    explanation?: string;
}

export interface OrderingQuestion extends BaseQuestion {
    type: 'ordering';
    items: { id: string; text: string }[];
    correctOrder: string[];
    explanation?: string;
}

export type Question = MultipleChoiceQuestion | FillBlankQuestion | DragDropQuestion | TrueFalseQuestion | OrderingQuestion;

export interface Activity {
    id: string;
    title: string;
    description: string;
    type: 'Cuestionario' | 'Competencia en tiempo real' | 'Mapa Interactivo' | 'Línea de Tiempo';
    dueDate: string;
    xp: number;
    maxAttempts: number;
    questions: Question[];
}