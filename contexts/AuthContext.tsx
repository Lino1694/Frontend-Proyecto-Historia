import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, AuthResponse } from '../services/api';
import { Role } from '../types';

interface User {
  id: number;
  nombre: string;
  correo: string;
  role: Role;
  avatar_url?: string;
  titulo?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  register: (nombre: string, correo: string, contrasena: string, role: Role) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay una sesión guardada al cargar
  useEffect(() => {
    const savedToken = apiService.getToken();
    const savedUser = apiService.getUser();
    const savedRole = localStorage.getItem('userRole') as Role | null;

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser({ ...savedUser, role: savedRole || undefined });
    }
    setIsLoading(false);
  }, []);

  const login = async (correo: string, contrasena: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiService.login({ correo, contrasena });

      // Guardar token y usuario
      apiService.saveAuth(response.token, response.user);
      localStorage.setItem('userRole', response.user.role);

      setToken(response.token);
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nombre: string, correo: string, contrasena: string, role: Role) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiService.register({ nombre, correo, contrasena, role });

      // Guardar token y usuario
      apiService.saveAuth(response.token, response.user);
      localStorage.setItem('userRole', role);

      setToken(response.token);
      setUser({ ...response.user, role });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.clearAuth();
    localStorage.removeItem('userRole');
    setUser(null);
    setToken(null);
    setError(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      apiService.saveAuth(token!, newUser); // Update stored user
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};