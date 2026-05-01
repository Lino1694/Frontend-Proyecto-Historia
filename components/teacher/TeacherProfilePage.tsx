import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../shared/Card';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { PencilIcon } from '../icons/PencilIcon';
import apiService from '../../services/api';

interface TeacherProfilePageProps {
  onBack: () => void;
}

const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({ onBack }) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    avatar_url: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        correo: user.correo || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile
      await apiService.updateProfile(user.id, formData);
      updateUser({ ...user, ...formData });

      // Change password if provided
      if (passwordData.currentPassword && passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          alert('Las contraseñas nuevas no coinciden.');
          setLoading(false);
          return;
        }
        if (passwordData.newPassword.length < 6) {
          alert('La contraseña nueva debe tener al menos 6 caracteres.');
          setLoading(false);
          return;
        }
        await apiService.changePassword(user.id, {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        });
        // Clear password fields
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }

      setIsEditing(false);
      alert('Perfil actualizado exitosamente.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        correo: user.correo || '',
        avatar_url: user.avatar_url || '',
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-lg text-slate-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-brand-cream animate-scale-in">
      <header className="p-4 bg-brand-offwhite shadow-sm flex items-center justify-center sticky top-0 z-10 relative">
        <button onClick={onBack} className="lg:hidden absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors text-base">
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Volver</span>
        </button>
        <h1 className="text-xl font-bold text-center text-slate-800">Mi Perfil</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors text-base"
        >
          <PencilIcon className="h-4 w-4" />
          <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-brand-orange rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                user.nombre.charAt(0).toUpperCase()
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{user.nombre}</h2>
            <p className="text-slate-600">{user.role === 'teacher' ? 'Docente' : 'Estudiante'}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Nombre Completo</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                />
              ) : (
                <p className="px-4 py-3 bg-brand-cream rounded-lg text-slate-800">{user.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Correo Electrónico</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                />
              ) : (
                <p className="px-4 py-3 bg-brand-cream rounded-lg text-slate-800">{user.correo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Avatar</label>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const dataUrl = e.target?.result as string;
                          handleInputChange('avatar_url', dataUrl);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-white hover:file:bg-brand-red-orange"
                  />
                  {formData.avatar_url && (
                    <div className="flex items-center space-x-3">
                      <img src={formData.avatar_url} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                      <span className="text-sm text-slate-600">Vista previa</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 px-4 py-3 bg-brand-cream rounded-lg">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold">
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-slate-800">{user.avatar_url ? 'Avatar establecido' : 'Sin avatar'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Rol</label>
              <p className="px-4 py-3 bg-brand-cream rounded-lg text-slate-800">{user.role === 'teacher' ? 'Docente' : 'Estudiante'}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Fecha de Registro</label>
              <p className="px-4 py-3 bg-brand-cream rounded-lg text-slate-800">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'No disponible'}
              </p>
            </div>

            {isEditing && (
              <>
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">Cambiar Contraseña</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Contraseña Actual</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                        placeholder="Ingresa tu contraseña actual"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                        placeholder="Ingresa la nueva contraseña"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-brand-cream border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                        placeholder="Confirma la nueva contraseña"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-brand-red-orange text-white font-bold py-3 rounded-lg hover:bg-brand-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TeacherProfilePage;