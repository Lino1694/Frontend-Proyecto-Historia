import React, { useState } from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

interface AuthPageProps {
    onLogin: (name: string, role: Role) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const { login, error, clearError, isLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        clearError();

        // Validaciones básicas
        if (!email.trim() || !password.trim()) {
            setLocalError('Todos los campos son obligatorios');
            return;
        }

        if (!email.includes('@')) {
            setLocalError('Por favor ingresa un correo válido');
            return;
        }

        if (password.length < 6) {
            setLocalError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            await login(email, password);
            // La navegación se maneja automáticamente por el useEffect en App.tsx
        } catch (err) {
            console.error('Error de autenticación:', err);
            // El error ya está manejado por el contexto
        }
    };

    const displayError = error || localError;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-cream p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center bg-brand-orange text-white p-3 rounded-full mb-3 shadow-md">
                       <BookOpenIcon className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800">Historia Lima</h1>
                    <p className="text-slate-600 mt-1">Tu aventura por la historia del Perú comienza aquí.</p>
                </div>

                <div className="bg-brand-offwhite p-8 rounded-2xl shadow-lg">
                    {displayError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {displayError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="email">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu.correo@ejemplo.com"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="password">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-brand-red-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-orange transform hover:-translate-y-1 transition-all duration-300 shadow-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Procesando...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;