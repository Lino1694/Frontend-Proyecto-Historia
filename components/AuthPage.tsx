import React, { useState } from 'react';
import { LoginRole } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import AvatarEditor from './shared/AvatarEditor';
import { PaletteIcon } from './icons/PaletteIcon';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
    onLogin: (name: string, role: LoginRole) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const { login, register, error, clearError, isLoading } = useAuth();
    
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [role, setRole] = useState<LoginRole>('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showAvatarEditor, setShowAvatarEditor] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        clearError();

        // Validaciones básicas
        if (authMode === 'register' && !name.trim()) {
            setLocalError('El nombre es obligatorio');
            return;
        }

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
            if (authMode === 'register') {
                await register(name, email, password, role);
                onLogin(name, role);
            } else {
                await login(email, password, role);
                // Obtener el nombre del usuario autenticado
                const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                onLogin(savedUser.nombre || 'Usuario', role);
            }
        } catch (err) {
            console.error('Error de autenticación:', err);
            // El error ya está manejado por el contexto
        }
    };

    const handleModeChange = (mode: 'login' | 'register') => {
        setAuthMode(mode);
        setLocalError(null);
        clearError();
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
                    <div className="flex border-b-2 border-brand-cream mb-6">
                        <button
                            onClick={() => handleModeChange('login')}
                            className={`flex-1 py-2 text-lg font-semibold transition-colors duration-300 ${authMode === 'login' ? 'text-brand-red-orange border-b-4 border-brand-red-orange' : 'text-slate-500'}`}
                        >
                            Ingresar
                        </button>
                        <button
                            onClick={() => handleModeChange('register')}
                            className={`flex-1 py-2 text-lg font-semibold transition-colors duration-300 ${authMode === 'register' ? 'text-brand-red-orange border-b-4 border-brand-red-orange' : 'text-slate-500'}`}
                        >
                            Registrarse
                        </button>
                    </div>

                    <div className="mb-6">
                         <div className="flex rounded-lg bg-brand-cream p-1">
                            <button 
                                onClick={() => setRole('student')} 
                                className={`w-1/2 p-2 rounded-md font-semibold text-center transition-all duration-300 ${role === 'student' ? 'bg-brand-yellow text-slate-800 shadow' : 'text-slate-600'}`}
                            >
                                Estudiante
                            </button>
                            <button 
                                onClick={() => setRole('teacher')} 
                                className={`w-1/2 p-2 rounded-md font-semibold text-center transition-all duration-300 ${role === 'teacher' ? 'bg-brand-yellow text-slate-800 shadow' : 'text-slate-600'}`}
                            >
                                Docente
                            </button>
                        </div>
                    </div>

                    {displayError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {displayError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {authMode === 'register' && (
                             <>
                                <div className="text-center mb-4">
                                    <p className="text-sm font-bold text-slate-600 mb-2">Crea tu Avatar</p>
                                    <div className="relative inline-block">
                                        <div className="w-24 h-24 rounded-full bg-brand-yellow-orange flex items-center justify-center text-4xl shadow-inner">
                                            <span>🧑‍🎓</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowAvatarEditor(true)}
                                            className="absolute bottom-0 right-0 bg-brand-orange text-white rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
                                            aria-label="Personalizar avatar">
                                            <PaletteIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="name">
                                        Nombre para mostrar
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej: Valeria R."
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none transition-colors"
                                    />
                                </div>
                            </>
                        )}
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
                                placeholder={authMode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-brand-red-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-orange transform hover:-translate-y-1 transition-all duration-300 shadow-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Procesando...' : (authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
                        </button>
                    </form>
                     {authMode === 'login' && (
                        <p className="text-center text-slate-500 text-sm mt-6">
                            ¿Aún no tienes cuenta? Cambia a la pestaña <span className="font-semibold">Registrarse</span>.
                        </p>
                    )}
                </div>
            </div>
            {showAvatarEditor && (
                <AvatarEditor 
                    onClose={() => setShowAvatarEditor(false)}
                    onSave={(config) => {
                        console.log('Avatar guardado:', config);
                        setShowAvatarEditor(false);
                    }}
                />
            )}
        </div>
    );
};

export default AuthPage;