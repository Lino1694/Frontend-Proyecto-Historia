import React, { useState } from 'react';
import { Card } from '../shared/Card';

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'individual' | 'competition';
  xpReward: number;
  participants: number;
  status: 'active' | 'completed';
  endDate: string;
}

const mockChallenges: Challenge[] = [
  {
    id: 1,
    title: 'Maratón de Historia',
    description: 'Completa 5 actividades en una semana',
    type: 'individual',
    xpReward: 150,
    participants: 12,
    status: 'active',
    endDate: '2025-12-01'
  },
  {
    id: 2,
    title: 'Competencia de Conocimientos',
    description: 'Gana puntos respondiendo preguntas correctamente',
    type: 'competition',
    xpReward: 200,
    participants: 8,
    status: 'active',
    endDate: '2025-12-05'
  }
];

const ChallengesCenter: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'individual' as 'individual' | 'competition',
    xpReward: 100,
    endDate: ''
  });

  const handleCreateChallenge = () => {
    const challenge: Challenge = {
      id: challenges.length + 1,
      ...newChallenge,
      participants: 0,
      status: 'active'
    };
    setChallenges([...challenges, challenge]);
    setNewChallenge({
      title: '',
      description: '',
      type: 'individual',
      xpReward: 100,
      endDate: ''
    });
    setShowCreateForm(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-cream">
      <header className="p-4 bg-brand-offwhite shadow-sm flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="font-bold text-2xl text-slate-600">{ '<' }</button>
        <h1 className="text-xl font-bold text-center text-slate-800 flex-1">Centro de Retos y Competencias</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-700">Retos Activos</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-red-orange transition-colors"
          >
            + Nuevo Reto
          </button>
        </div>

        {showCreateForm && (
          <Card>
            <h3 className="text-lg font-bold text-slate-700 mb-4">Crear Nuevo Reto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 text-sm font-bold mb-2">Título</label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                  placeholder="Ej: Maratón de Historia"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-bold mb-2">Descripción</label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                  rows={3}
                  placeholder="Describe el reto..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-2">Tipo</label>
                  <select
                    value={newChallenge.type}
                    onChange={(e) => setNewChallenge({...newChallenge, type: e.target.value as 'individual' | 'competition'})}
                    className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                  >
                    <option value="individual">Individual</option>
                    <option value="competition">Competencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-2">XP Recompensa</label>
                  <input
                    type="number"
                    value={newChallenge.xpReward}
                    onChange={(e) => setNewChallenge({...newChallenge, xpReward: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-bold mb-2">Fecha de Fin</label>
                <input
                  type="date"
                  value={newChallenge.endDate}
                  onChange={(e) => setNewChallenge({...newChallenge, endDate: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateChallenge}
                  className="bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-red-orange transition-colors"
                >
                  Crear Reto
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      challenge.type === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {challenge.type === 'individual' ? 'Individual' : 'Competencia'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      challenge.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {challenge.status === 'active' ? 'Activo' : 'Completado'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{challenge.title}</h3>
                  <p className="text-slate-600 text-sm mb-2">{challenge.description}</p>
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span>👥 {challenge.participants} participantes</span>
                    <span>⭐ {challenge.xpReward} XP</span>
                    <span>📅 Hasta {new Date(challenge.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-brand-yellow-orange text-slate-800 font-bold py-1 px-3 rounded-lg hover:bg-brand-light-orange transition-colors text-sm">
                    Editar
                  </button>
                  <button className="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm">
                    Eliminar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {challenges.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-slate-600">No hay retos activos</p>
              <p className="text-sm text-slate-500 mt-2">Crea tu primer reto para motivar a los estudiantes</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChallengesCenter;