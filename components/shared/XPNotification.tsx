import React, { useEffect } from 'react';

interface XPNotificationProps {
  xpGanado: number;
  subioNivel: boolean;
  nivelNuevo?: number;
  tituloNivel?: string;
  iconoNivel?: string;
  onClose: () => void;
}

const XPNotification: React.FC<XPNotificationProps> = ({
  xpGanado,
  subioNivel,
  nivelNuevo,
  tituloNivel,
  iconoNivel,
  onClose,
}) => {
  // Auto-cerrar después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (subioNivel) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-scale-in backdrop-blur-sm">
        <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-2xl p-8 shadow-2xl w-full max-w-sm mx-4 text-center animate-scale-in">
          <div className="text-8xl mb-4 animate-bounce">{iconoNivel || '🎉'}</div>
          <h2 className="text-3xl font-bold text-white mb-2">¡SUBISTE DE NIVEL!</h2>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
            <p className="text-6xl font-bold text-white mb-2">Nivel {nivelNuevo}</p>
            <p className="text-xl font-semibold text-white">{tituloNivel}</p>
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 mb-4">
            <p className="text-white font-bold">+{xpGanado} XP</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-white text-orange-600 font-bold py-3 rounded-lg hover:bg-orange-50 transition-colors"
          >
            ¡Continuar!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-scale-in">
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-4 shadow-lg flex items-center space-x-3 min-w-[250px]">
        <div className="text-3xl">✨</div>
        <div className="flex-1">
          <p className="text-white font-bold">+{xpGanado} XP</p>
          <p className="text-white/90 text-sm">¡Sigue así!</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default XPNotification;