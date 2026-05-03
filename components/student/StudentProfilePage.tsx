import React, { useState } from 'react';
import { Card } from '../shared/Card';
import { ProgressBar } from '../shared/ProgressBar';
import { useTheme } from '../../contexts/ThemeContext';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import { useAuth } from '../../contexts/AuthContext';
import { useXP } from '../../hooks/useXP';
import apiService from '../../services/api';

type Theme = 'light' | 'dark' | 'current';


interface StudentProfilePageProps {
    userName: string;
}

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

const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ userName }) => {
    const [showDataEditor, setShowDataEditor] = useState(false);
    const [editedName, setEditedName] = useState(userName);
    const [selectedAvatar, setSelectedAvatar] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop');
    const [selectedTitle, setSelectedTitle] = useState('explorador');
    const [isSaving, setIsSaving] = useState(false);
    const { theme, setTheme, themeClasses } = useTheme();
    const { progress } = useClassProgress();
    const { user, updateUser } = useAuth();
    const { perfilXP } = useXP(user?.id || null);

    const titles = [
        'explorador', 'maestro', 'inca', 'inti', 'almirante', 'capitan', 'soldado', 'historiador'
    ];

    const avatars = [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop'
    ];

    const classes = [
        { id: 'caral-ciudad', label: 'Caral - La Primera Ciudad' },
        { id: 'pre-inca', label: 'Culturas Pre-Incaicas' },
        { id: 'cultura-inca', label: 'La Cultura Inca' },
        { id: 'virreinato', label: 'El Virreinato del Perú' },
        { id: 'independencia', label: 'La Independencia' },
        { id: 'batalla-angamos', label: 'La Batalla de Angamos' },
    ];

    const generalProgress = Math.min(100, Math.round((perfilXP?.xp?.total || 0) * 0.2));



    const handleSaveData = async () => {
        if (!user || !editedName.trim()) return;

        setIsSaving(true);
        try {
            await apiService.updateProfile(user.id, {
                nombre: editedName.trim(),
                avatar_url: selectedAvatar,
                titulo: selectedTitle
            });
            updateUser({
                ...user,
                nombre: editedName.trim(),
                avatar_url: selectedAvatar,
                titulo: selectedTitle
            });
            setShowDataEditor(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error al actualizar los datos');
        } finally {
            setIsSaving(false);
        }
    };

    const SettingItem: React.FC<{label: string, value: string, hasArrow?: boolean}> = ({label, value, hasArrow = true}) => (
        <button className="w-full flex justify-between items-center py-3 text-left">
            <span className={`font-semibold ${themeClasses.cardText}`}>{label}</span>
            <div className="flex items-center space-x-2">
                <span className={themeClasses.secondaryText}>{value}</span>
                {hasArrow && <span className="text-slate-400">&gt;</span>}
            </div>
        </button>
    );

    return (
        <div className={`${themeClasses.bg} min-h-full`}>
             <header className={`p-4 ${themeClasses.headerBg} shadow-sm flex items-center justify-between`}>
                <h1 className={`text-xl font-bold ${themeClasses.headerText}`}>Perfil del Estudiante</h1>
             </header>

            <div className="p-4 space-y-6">
                <Card className={`text-center ${themeClasses.cardBg} ${themeClasses.border}`}>
                    <img src={user?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop"} alt="Avatar" className={`w-24 h-24 rounded-full mx-auto border-4 border-brand-yellow mb-2 ${themeClasses.bg} object-cover`}/>
                    <h2 className={`text-xl font-bold mt-2 ${themeClasses.cardText}`}>{userName}</h2>
                    <div className="space-y-1">
                        {user?.titulo && (
                            <p className={`text-sm font-semibold text-brand-orange capitalize`}>
                                {user.titulo}
                            </p>
                        )}
                        <p className={`text-sm ${themeClasses.secondaryText}`}>
                            Nivel {perfilXP?.nivel?.actual || 1} • {perfilXP?.xp?.total || 0} XP
                        </p>
                    </div>
                    <div className="flex justify-center space-x-6 mt-3 text-sm">
                        <div>
                            <p className={`font-bold text-lg ${themeClasses.cardText}`}>🔥 12</p>
                            <p className={themeClasses.secondaryText}>Racha</p>
                        </div>
                        <div>
                             <p className={`font-bold text-lg ${themeClasses.cardText}`}>🏆 3º</p>
                            <p className={themeClasses.secondaryText}>Posición</p>
                        </div>
                    </div>
                </Card>

                <Card className={`${themeClasses.cardBg} ${themeClasses.border}`}>
                    <h3 className={`text-lg font-bold mb-3 ${themeClasses.cardText}`}>Progreso General</h3>
                    <div className="space-y-4">
                        <HistoricalTimeline progress={generalProgress} avatarUrl={user?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop"} />

                        <div>
                            <h4 className={`text-sm font-semibold ${themeClasses.cardText} mb-2`}>Progreso por clase</h4>
                            <div className="space-y-3">
                                {classes.map(c => (
                                    <div key={c.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className={`font-semibold ${themeClasses.cardText}`}>{c.label}</span>
                                            <span className={themeClasses.secondaryText}>{progress[c.id] ?? 0}%</span>
                                        </div>
                                        <ProgressBar progress={progress[c.id] ?? 0} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className={`${themeClasses.cardBg} ${themeClasses.border}`}>
                    <h3 className={`text-lg font-bold mb-1 ${themeClasses.cardText}`}>Personalización</h3>
                     <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-brand-cream'}`}>
                        <div className="py-3">
                            <span className={`font-semibold ${themeClasses.cardText}`}>Temas de color</span>
                            <div className="flex space-x-2 mt-2">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        theme === 'light' ? 'bg-blue-500 text-white' : (theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                                    }`}
                                >
                                    Claro
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Oscuro
                                </button>
                                <button
                                    onClick={() => setTheme('current')}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        theme === 'current' ? 'bg-yellow-500 text-white' : (theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                                    }`}
                                >
                                    Actual
                                </button>
                            </div>
                        </div>
                        <div className="py-3">
                            <button
                                onClick={() => setShowDataEditor(true)}
                                className={`w-full text-left font-semibold ${themeClasses.cardText} hover:text-brand-orange transition-colors`}
                            >
                                Editar datos
                            </button>
                        </div>
                     </div>
                </Card>

                <div className="text-center">
                    <button className="text-red-500 font-semibold px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors">
                        Eliminar cuenta
                    </button>
                </div>
            </div>
            {showDataEditor && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md animate-scale-in flex flex-col" style={{maxHeight: '90vh'}}>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Editar Datos del Perfil</h2>
                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none"
                                    placeholder="Ingresa tu nombre"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Avatar</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {avatars.map((avatar, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedAvatar(avatar)}
                                            className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedAvatar === avatar ? 'border-blue-500' : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Título</label>
                                <select
                                    value={selectedTitle}
                                    onChange={(e) => setSelectedTitle(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none"
                                >
                                    {titles.map((title) => (
                                        <option key={title} value={title}>
                                            {title.charAt(0).toUpperCase() + title.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowDataEditor(false)}
                                className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveData}
                                disabled={isSaving || !editedName.trim()}
                                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfilePage;