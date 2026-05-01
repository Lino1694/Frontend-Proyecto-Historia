import { useState, useEffect, useCallback } from 'react';
import { apiService, PerfilXPResponse, XPResponse } from '../services/api';

export const useXP = (userId: number | null) => {
  const [perfilXP, setPerfilXP] = useState<PerfilXPResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [ultimoXPGanado, setUltimoXPGanado] = useState<XPResponse | null>(null);

  // Cargar perfil de XP
  const cargarPerfilXP = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const perfil = await apiService.obtenerPerfilXP(userId);
      const ranking = await apiService.obtenerRanking('student', 10);

      // Agregar ranking al perfil
      const perfilConRanking = {
        ...perfil,
        ranking: ranking
      };

      setPerfilXP(perfilConRanking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfil XP');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Otorgar XP
  const otorgarXP = useCallback(async (
    cantidad: number,
    tipo: 'actividad_completada' | 'respuesta_correcta' | 'racha_diaria' | 'insignia' | 'bonus_profesor',
    descripcion?: string,
    actividad_id?: number
  ) => {
    if (!userId) return null;

    try {
      setLoading(true);
      const resultado = await apiService.otorgarXP(userId, cantidad, tipo, descripcion, actividad_id);
      
      // Actualizar perfil local
      if (perfilXP) {
        setPerfilXP({
          ...perfilXP,
          xp: {
            ...perfilXP.xp,
            total: resultado.xp_nuevo,
          },
          nivel: {
            ...perfilXP.nivel,
            actual: resultado.nivel_nuevo,
            titulo: resultado.titulo_nivel,
            icono: resultado.icono_nivel,
          },
        });
      }

      // Mostrar notificación si subió de nivel
      if (resultado.subio_nivel) {
        setUltimoXPGanado(resultado);
        setMostrarNotificacion(true);
      }

      return resultado;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al otorgar XP');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, perfilXP]);

  // Actualizar racha diaria
  const actualizarRacha = useCallback(async () => {
    if (!userId) return null;

    try {
      setLoading(true);
      const resultado = await apiService.actualizarRacha(userId);
      
      // Recargar perfil si ganó XP
      if (resultado.xp_ganado > 0) {
        await cargarPerfilXP();
      }

      return resultado;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar racha');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, cargarPerfilXP]);

  // Cerrar notificación
  const cerrarNotificacion = useCallback(() => {
    setMostrarNotificacion(false);
    setUltimoXPGanado(null);
  }, []);

  // Cargar perfil al montar o cuando cambie el userId
  useEffect(() => {
    if (userId) {
      cargarPerfilXP();
    }
  }, [userId, cargarPerfilXP]);

  return {
    perfilXP,
    loading,
    error,
    mostrarNotificacion,
    ultimoXPGanado,
    otorgarXP,
    actualizarRacha,
    cargarPerfilXP,
    cerrarNotificacion,
  };
};