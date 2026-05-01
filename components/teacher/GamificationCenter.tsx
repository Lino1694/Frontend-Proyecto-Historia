import React from 'react';
import { Card } from '../shared/Card';

const mockRanking = [
    { rank: 1, name: 'Sofia Ramos', xp: 2058 },
    { rank: 2, name: 'Luis Chavez', xp: 1980 },
    { rank: 3, name: 'Paula Núñez', xp: 1768 },
];

const GamificationCenter: React.FC<{onBack: () => void}> = ({ onBack }) => {
    return (
        <div className="flex-1 overflow-y-auto bg-brand-cream">
            <header className="p-4 bg-brand-offwhite shadow-sm flex items-center sticky top-0 z-10">
                <button onClick={onBack} className="font-bold text-2xl text-slate-600">&lt;</button>
                <h1 className="text-xl font-bold text-center text-slate-800 flex-1">Centro de Gamificación</h1>
            </header>

            <div className="p-4 space-y-6">
                <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Tabla de Posiciones</h2>
                    <ul className="space-y-2">
                         {mockRanking.map(player => (
                             <li key={player.name} className="flex items-center justify-between p-2 rounded-lg text-sm bg-brand-cream">
                                <div className="flex items-center">
                                    <span className="font-bold w-6">{player.rank}.</span>
                                    <span>{player.name}</span>
                                </div>
                                <span className="font-bold text-slate-600">{player.xp} pts</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                 <Card>
                    <div className="flex justify-between items-center mb-3">
                         <h2 className="text-lg font-bold text-slate-700">Reglas de Puntos</h2>
                         <button className="text-sm font-semibold bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-md hover:bg-brand-orange/30">+ Nueva</button>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-brand-cream rounded-lg">
                            <span>Respuesta correcta</span>
                            <span className="font-semibold">+10 pts</span>
                        </div>
                        <div className="flex justify-between p-2 bg-brand-cream rounded-lg">
                            <span>Entrega puntual</span>
                            <span className="font-semibold">+5 pts</span>
                        </div>
                         <div className="flex justify-between p-2 bg-brand-cream rounded-lg">
                            <span>Trabajo colaborativo</span>
                            <span className="font-semibold">+8 pts</span>
                        </div>
                    </div>
                </Card>

                 <Card>
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Niveles y Recompensas</h2>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 bg-brand-yellow-orange rounded-lg">
                            <p className="font-bold text-lg">I</p>
                            <p className="text-xs">0 - 199 pts</p>
                        </div>
                        <div className="p-3 bg-brand-light-orange rounded-lg">
                             <p className="font-bold text-lg">II</p>
                            <p className="text-xs">200 - 399 pts</p>
                        </div>
                        <div className="p-3 bg-brand-orange rounded-lg text-white">
                             <p className="font-bold text-lg">III</p>
                            <p className="text-xs">400 - 699 pts</p>
                        </div>
                        <div className="p-3 bg-brand-red-orange rounded-lg text-white">
                            <p className="font-bold text-lg">IV</p>
                            <p className="text-xs">700 - 999 pts</p>
                        </div>
                    </div>
                </Card>
                
                <Card>
                     <h2 className="text-lg font-bold text-slate-700 mb-2">Ajustes</h2>
                     <div className="flex justify-between items-center text-sm">
                        <label htmlFor="gamification-toggle" className="font-semibold text-slate-700">Activar gamificación</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" id="gamification-toggle" className="sr-only peer" defaultChecked/>
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                        </label>
                     </div>
                </Card>
            </div>
        </div>
    );
};

export default GamificationCenter;
