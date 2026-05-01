export const mockChallenges = [
  {
    id: 1,
    titulo: 'Maratón de Historia',
    descripcion: 'Completa 5 actividades en una semana',
    tipo: 'individual' as 'individual' | 'competition',
    xp_recompensa: 150,
    participantes: 12,
    estado: 'active' as 'active' | 'completed',
    fecha_fin: '2025-12-01',
    creador_id: 1
  },
  {
    id: 2,
    titulo: 'Competencia de Conocimientos',
    descripcion: 'Gana puntos respondiendo preguntas correctamente',
    tipo: 'competition' as 'individual' | 'competition',
    xp_recompensa: 200,
    participantes: 8,
    estado: 'active' as 'active' | 'completed',
    fecha_fin: '2025-12-05',
    creador_id: 1
  }
];