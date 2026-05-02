import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { apiService } from '../../services/api';

interface StudentData {
    id: number;
    nombre: string;
    avatar_url: string;
    nivel: number;
    xp_total: number;
    progreso_general: number;
    progreso_por_tema: {
        tema: string;
        progreso: number;
    }[];
    ultima_actividad: string;
    estado_activo: boolean;
}

// Mock data representing students that would come from the backend
// In production, this will be replaced with real API data
const mockClass: StudentData[] = [
    {
        id: 1,
        nombre: 'Ana García',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
        nivel: 7,
        xp_total: 1650,
        progreso_general: 68,
        progreso_por_tema: [
            { tema: 'Historia del Perú', progreso: 85 },
            { tema: 'Geografía', progreso: 45 },
            { tema: 'Ciencias Sociales', progreso: 75 },
        ],
        ultima_actividad: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        estado_activo: true,
    },
    {
        id: 2,
        nombre: 'Carlos Mendoza',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
        nivel: 5,
        xp_total: 980,
        progreso_general: 42,
        progreso_por_tema: [
            { tema: 'Historia del Perú', progreso: 50 },
            { tema: 'Geografía', progreso: 30 },
            { tema: 'Ciencias Sociales', progreso: 55 },
        ],
        ultima_actividad: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        estado_activo: false,
    },
    {
        id: 3,
        nombre: 'Lucía Torres',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
        nivel: 9,
        xp_total: 2450,
        progreso_general: 92,
        progreso_por_tema: [
            { tema: 'Historia del Perú', progreso: 100 },
            { tema: 'Geografía', progreso: 85 },
            { tema: 'Ciencias Sociales', progreso: 95 },
        ],
        ultima_actividad: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
        estado_activo: true,
    },
    {
        id: 4,
        nombre: 'Miguel Sánchez',
        avatar_url: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=256&auto=format&fit=crop',
        nivel: 6,
        xp_total: 1320,
        progreso_general: 58,
        progreso_por_tema: [
            { tema: 'Historia del Perú', progreso: 70 },
            { tema: 'Geografía', progreso: 40 },
            { tema: 'Ciencias Sociales', progreso: 65 },
        ],
        ultima_actividad: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        estado_activo: false,
    },
    {
        id: 5,
        nombre: 'Sofia Ramírez',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop',
        nivel: 8,
        xp_total: 1890,
        progreso_general: 78,
        progreso_por_tema: [
            { tema: 'Historia del Perú', progreso: 90 },
            { tema: 'Geografía', progreso: 65 },
            { tema: 'Ciencias Sociales', progreso: 80 },
        ],
        ultima_actividad: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
        estado_activo: true,
    },
    {
        id: 6,
        nombre: 'Diego Flores',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
        nivel: 4,
        xp_total: 720,
        progreso_general: 31,
        progreso_por_tema: [
            { tema: 'Historia del Perú', progreso: 35 },
            { tema: 'Geografía', progreso: 20 },
            { tema: 'Ciencias Sociales', progreso: 40 },
        ],
        ultima_actividad: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        estado_activo: false,
    },
];

type FilterStatus = 'all' | 'needs_support' | 'outstanding';

const HistoricalTimeline: React.FC<{ progress: number; avatarUrl: string }> = ({ progress, avatarUrl }) => {
    const periods = [
        { name: 'Caral', color: 'bg-green-500', width: '20%' },
        { name: 'Inca', color: 'bg-yellow-500', width: '20%' },
        { name: 'Conquista', color: 'bg-red-500', width: '20%' },
        { name: 'Virreinato', color: 'bg-purple-500', width: '20%' },
        { name: 'Independencia', color: 'bg-blue-500', width: '20%' },
    ];

    const markerPosition = `${Math.max(2, Math.min(98, progress))}%`;

    return (
        <div className="mt-4">
            <p className="text-xs font-bold text-slate-600 mb-2">Línea de Tiempo del Curso</p>
            <div className="relative pt-3">
                <div 
                    className="absolute z-10 transition-all duration-500" 
                    style={{ left: `calc(${markerPosition} - 14px)`, top: '-4px' }}
                    title={`Progreso: ${progress}%`}
                >
                   <img src={avatarUrl} alt="avatar" className="w-7 h-7 rounded-full border-2 border-white shadow-lg object-cover" />
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-brand-cream shadow-inner">
                    {periods.map(p => (
                        <div key={p.name} className={`${p.color}`} style={{ width: p.width }} />
                    ))}
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-semibold text-slate-500 px-1">
                    {periods.map(p => <span key={p.name}>{p.name}</span>)}
                </div>
            </div>
        </div>
    );
};


const ClassManagementPage: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [students, setStudents] = useState<StudentData[]>(mockClass);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchStudentsProgress = async () => {
        setLoading(true);
        try {
            const data = await apiService.obtenerProgresoEstudiantes();
            // Only update if we got valid data with progress
            if (data && data.length > 0 && data[0].progreso_general > 0) {
                setStudents(data);
                setLastUpdate(new Date());
            } else {
                // Keep mock data if API returns empty or 0 progress
                console.log('API devolvió datos vacíos o sin progreso, usando datos de demostración');
            }
        } catch (error) {
            console.error('Error fetching students progress:', error);
            // Keep mock data as fallback - backend not implemented yet
            console.log('Usando datos de demostración hasta que se implemente el backend');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentsProgress();

        // Auto-refresh every 30 seconds for real-time updates
        const interval = setInterval(fetchStudentsProgress, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredStudents = useMemo(() => {
        return students
            .filter(student => student.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(student => {
                if (filterStatus === 'needs_support') return student.progreso_general < 60;
                if (filterStatus === 'outstanding') return student.progreso_general > 85;
                return true;
            });
    }, [students, searchTerm, filterStatus]);

    return (
        <div className="flex flex-col h-full bg-brand-cream animate-scale-in">
            <header className="p-4 bg-brand-offwhite shadow-sm flex items-center justify-center sticky top-0 z-10 relative">
                 <button onClick={onBack} className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors text-base">
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Volver</span>
                </button>
                <h1 className="text-xl font-bold text-center text-slate-800">Gestión de Clase</h1>
            </header>

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchStudentsProgress}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-red-orange disabled:opacity-50 text-sm"
                        >
                            {loading ? 'Actualizando...' : '🔄 Actualizar'}
                        </button>
                        <span className="text-xs text-slate-500">
                            Última actualización: {lastUpdate.toLocaleTimeString()}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">{filteredStudents.length} estudiantes</p>
                        <p className="text-xs text-slate-500">
                            {filteredStudents.filter(s => s.progreso_general < 60).length} necesitan apoyo
                        </p>
                    </div>
                </div>

                <div className="relative mb-2">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar estudiante..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-brand-offwhite border-2 border-transparent focus:border-brand-light-orange focus:outline-none transition-colors"
                    />
                </div>
                <div className="flex rounded-lg bg-brand-cream/70 p-1 text-sm font-semibold">
                    <button onClick={() => setFilterStatus('all')} className={`flex-1 p-1.5 rounded-md transition-colors ${filterStatus === 'all' ? 'bg-brand-yellow text-slate-800 shadow' : 'text-slate-600'}`}>Todos</button>
                    <button onClick={() => setFilterStatus('outstanding')} className={`flex-1 p-1.5 rounded-md transition-colors ${filterStatus === 'outstanding' ? 'bg-brand-yellow text-slate-800 shadow' : 'text-slate-600'}`}>Destacados</button>
                    <button onClick={() => setFilterStatus('needs_support')} className={`flex-1 p-1.5 rounded-md transition-colors ${filterStatus === 'needs_support' ? 'bg-brand-yellow text-slate-800 shadow' : 'text-slate-600'}`}>Necesitan Apoyo</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
                {filteredStudents.length > 0 ? filteredStudents.map(student => (
                    <Card key={student.id}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <img src={student.avatar_url} alt={student.nombre} className="w-12 h-12 rounded-full mr-3 object-cover bg-brand-yellow-orange" />
                                <div>
                                    <h3 className="font-bold text-slate-800">{student.nombre}</h3>
                                    <p className="text-xs text-slate-500">Nivel {student.nivel} • {student.xp_total} XP</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${student.estado_activo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <span className="text-xs text-slate-400">
                                            {student.estado_activo ? 'Activo ahora' : `Última actividad: ${new Date(student.ultima_actividad).toLocaleDateString()}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-brand-orange">{student.progreso_general}%</p>
                                <p className="text-xs text-slate-500">General</p>
                            </div>
                        </div>

                        <HistoricalTimeline progress={student.progreso_general} avatarUrl={student.avatar_url} />

                        <div className="space-y-2 mt-4 pt-4 border-t border-brand-cream">
                              <p className="text-xs font-bold text-slate-600 mb-1">Desglose por Tema</p>
                            {student.progreso_por_tema.map(tema => (
                                <div key={tema.tema}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-600">{tema.tema}</span>
                                        <span className="font-bold text-slate-500">{tema.progreso}%</span>
                                    </div>
                                    <ProgressBar progress={tema.progreso} />
                                </div>
                            ))}
                        </div>
                    </Card>
                )) : (
                    <div className="text-center pt-10">
                        <p className="font-semibold text-slate-600">No se encontraron estudiantes.</p>
                        <p className="text-sm text-slate-500">Ajusta los filtros o el término de búsqueda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassManagementPage;