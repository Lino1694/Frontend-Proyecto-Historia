import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ChatbotSelectionProps {
  onSelect: (characterId: string) => void;
  onBack?: () => void;
}

const characters = [
  {
    id: 'inka',
    name: 'Apu Huallpa',
    avatar: '🦙',
    description: 'Un guardián de quipus del Imperio Inca. Conoce sobre el Tahuantinsuyo, sus templos y caminos.',
    period: '1200-1572 d.C.'
  },
  {
    id: 'viceroyalty',
    name: 'Don Francisco de Toledo',
    avatar: '🏰',
    description: 'Virrey del Perú durante la época colonial española. Gobernó con justicia y orden.',
    period: '1532-1821 d.C.'
  },
  {
    id: 'caral',
    name: 'Sacerdote de Caral',
    avatar: '🏛️',
    description: 'Habitante de la antigua civilización Caral. Construyeron pirámides y vivieron en paz.',
    period: '3000-1800 a.C.'
  },
  {
    id: 'conquistador',
    name: 'Don Francisco de Ávila',
    avatar: '⚔️',
    description: 'Conquistador español presente en la llegada al Perú. Conoce la historia de la conquista.',
    period: '1532-1614 d.C.'
  },
  {
    id: 'independencia',
    name: 'Don José de la Mar',
    avatar: '🕊️',
    description: 'Líder de la independencia del Perú. Fue presidente y militar por la libertad.',
    period: '1776-1830 d.C.'
  }
];

export default function ChatbotSelection({ onSelect, onBack }: ChatbotSelectionProps) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Chatbot Histórico</h1>
          <p className="text-slate-600 mt-2">Selecciona un personaje para conversar sobre historia del Perú.</p>
        </div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-slate-500 font-semibold hover:text-slate-800 transition-colors"
          >
            ← Volver
          </button>
        ) : null}
      </header>

      <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <button
            key={character.id}
            onClick={() => onSelect(character.id)}
            className="group bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-3xl bg-green-100 flex items-center justify-center text-2xl">
                {character.avatar}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{character.name}</h2>
                <p className="text-sm text-slate-500">{character.period}</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-6">{character.description}</p>
            <div className="flex items-center justify-between text-sm font-bold text-orange-600">
              <span>Comenzar</span>
              <MessageSquare className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}