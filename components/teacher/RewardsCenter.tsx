import React, { useState } from 'react';
import { Card } from '../shared/Card';
import { StudentProgress } from '../../types';

interface RewardsCenterProps {
    onBack: () => void;
}

const mockStudents: StudentProgress[] = [
    { name: 'Diego Pérez', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop', progress: 72 },
    { name: 'Maria López', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop', progress: 89 },
    { name: 'Jorge Rios', avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=256&auto=format&fit=crop', progress: 54 },
    { name: 'Valeria Rojas', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop', progress: 95 },
];

const mockInsignias = [
    { name: 'Colaborador', icon: '🤝' },
    { name: 'Líder', icon: '⭐' },
    { name: 'Creativo', icon: '🎨' },
    { name: 'Perseverante', icon: '💪' },
    { name: 'Curioso', icon: '🔍' },
    { name: 'Puntual', icon: '⏰' },
];


const RewardsCenter: React.FC<RewardsCenterProps> = ({ onBack }) => {
    const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
    const [activeTab, setActiveTab] = useState<'badges' | 'points'>('badges');

    const handleSelectStudent = (student: StudentProgress) => {
        setSelectedStudent(student);
        setActiveTab('badges'); // Reset to default tab
    };
    
    const handleCloseModal = () => {
        setSelectedStudent(null);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-brand-cream animate-scale-in">
            <header className="p-4 bg-brand-offwhite shadow-sm flex items-center sticky top-0 z-10">
                <button onClick={onBack} className="font-bold text-2xl text-slate-600 mr-4">&lt;</button>
                <h1 className="text-xl font-bold text-center text-slate-800 flex-1">Insignias y Puntos Extras</h1>
            </header>
            
            <div className="p-4">
                <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Seleccionar Estudiante</h2>
                    <ul className="space-y-3">
                        {mockStudents.map(student => (
                            <li key={student.name} className="flex items-center justify-between p-2 rounded-lg bg-brand-cream">
                                <div className="flex items-center">
                                    <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full mr-3 object-cover bg-brand-yellow-orange"/>
                                    <span className="font-semibold text-slate-800">{student.name}</span>
                                </div>
                                <button 
                                    onClick={() => handleSelectStudent(student)}
                                    className="bg-brand-orange text-white font-bold py-1.5 px-4 rounded-lg hover:bg-brand-red-orange transition-colors text-sm">
                                    Premiar
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* Reward Modal */}
            {selectedStudent && (
                <div className="absolute inset-0 bg-black/50 flex items-end justify-center z-20 backdrop-blur-sm" onClick={handleCloseModal}>
                    <div className="bg-brand-offwhite rounded-t-2xl p-6 shadow-xl w-full max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800">Premiar a {selectedStudent.name}</h2>
                            <button onClick={handleCloseModal} className="font-bold text-2xl text-slate-500">&times;</button>
                        </div>

                        <div className="flex border-b-2 border-brand-cream mb-4">
                            <button onClick={() => setActiveTab('badges')} className={`flex-1 py-2 font-semibold transition-colors ${activeTab === 'badges' ? 'text-brand-red-orange border-b-4 border-brand-red-orange' : 'text-slate-500'}`}>
                                Insignias
                            </button>
                             <button onClick={() => setActiveTab('points')} className={`flex-1 py-2 font-semibold transition-colors ${activeTab === 'points' ? 'text-brand-red-orange border-b-4 border-brand-red-orange' : 'text-slate-500'}`}>
                                Puntos Extras
                            </button>
                        </div>

                        {activeTab === 'badges' && (
                            <div>
                                <p className="text-sm text-slate-600 mb-3">Selecciona una insignia para otorgar:</p>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    {mockInsignias.map(badge => (
                                        <button key={badge.name} className="flex flex-col items-center p-2 rounded-lg hover:bg-brand-yellow-orange transition-colors">
                                            <div className="text-4xl p-3 bg-brand-cream rounded-full">{badge.icon}</div>
                                            <span className="text-xs font-semibold mt-1 text-slate-700">{badge.name}</span>
                                        </button>
                                    ))}
                                </div>
                                 <button onClick={handleCloseModal} className="w-full mt-6 bg-brand-orange text-white font-bold py-3 rounded-lg">Otorgar Insignia</button>
                            </div>
                        )}

                        {activeTab === 'points' && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="extra-points" className="block text-sm font-bold text-slate-600 mb-2">Cantidad de Puntos (XP)</label>
                                    <input type="number" id="extra-points" placeholder="Ej: 50" className="w-full px-4 py-3 rounded-lg bg-brand-cream text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange" />
                                </div>
                                <div>
                                    <label htmlFor="reason" className="block text-sm font-bold text-slate-600 mb-2">Motivo (opcional)</label>
                                    <input type="text" id="reason" placeholder="Ej: Excelente participación" className="w-full px-4 py-3 rounded-lg bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-orange" />
                                </div>
                                <button onClick={handleCloseModal} className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg">Otorgar Puntos</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RewardsCenter;