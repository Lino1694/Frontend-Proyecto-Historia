import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ChatbotSelectionProps {
  onSelect: (characterId: string) => void;
  onBack?: () => void;
}

const characters = [
  {
    id: 'auge_virreinal',
    name: 'Don Manuel de Amat',
    avatar: '🏛️',
    description: 'Virrey del Perú durante las Reformas Borbónicas. Conoce sobre la sociedad colonial y los cambios del siglo XVIII.',
    period: '1761-1776 d.C.'
  },
  {
    id: 'rebeliones_indigenas',
    name: 'Micaela Bastidas',
    avatar: '⚔️',
    description: 'Líder femenina de la gran rebelión contra los abusos españoles. Luchó por la libertad y justicia indígena.',
    period: '1780-1783 d.C.'
  },
  {
    id: 'conspiraciones_criollas',
    name: 'Hipólito Unanue',
    avatar: '📚',
    description: 'Médico y sabio de las ideas de libertad. Conoce sobre conspiraciones y precursores de la independencia.',
    period: '1808-1814 d.C.'
  },
  {
    id: 'campana_sur',
    name: 'Don José de San Martín',
    avatar: '🕊️',
    description: 'Líder de la Expedición Libertadora del Sur. Proclamó la independencia del Perú en 1821.',
    period: '1820-1822 d.C.'
  },
  {
    id: 'consolidacion_norte',
    name: 'Antonio José de Sucre',
    avatar: '🎖️',
    description: 'Gran Mariscal que selló la independencia con la Batalla de Ayacucho. Puso fin al dominio español.',
    period: '1823-1824 d.C.'
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
