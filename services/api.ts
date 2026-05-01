const API_URL = 'http://localhost:5000/api';

export interface RegisterData {
  nombre: string;
  correo: string;
  contrasena: string;
  role?: 'student' | 'teacher' | 'moderator';
}

export interface LoginData {
  correo: string;
  contrasena: string;
  loginRole?: 'student' | 'teacher';
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    nombre: string;
    correo: string;
    role: 'student' | 'teacher' | 'moderator';
    xp_total?: number;
    nivel?: number;
    racha_dias?: number;
    avatar_url?: string;
    created_at?: string;
  };
  token: string;
}

export interface XPResponse {
  message: string;
  xp_anterior: number;
  xp_ganado: number;
  xp_nuevo: number;
  nivel_anterior: number;
  nivel_nuevo: number;
  subio_nivel: boolean;
  titulo_nivel: string;
  icono_nivel: string;
}

export interface PerfilXPResponse {
  usuario: {
    id: number;
    nombre: string;
    correo: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
  };
  xp: {
    total: number;
    en_nivel_actual: number;
    necesario_para_siguiente: number;
  };
  nivel: {
    actual: number;
    titulo: string;
    icono: string;
    xp_minimo: number;
    xp_maximo: number;
    progreso: number;
  };
  racha_dias: number;
  posicion_ranking: number;
  ranking: RankingUsuario[];
  insignias: Array<{
    id: number;
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
    obtenida_en: string;
  }>;
  historial_reciente: Array<{
    cantidad: number;
    tipo: string;
    descripcion: string;
    created_at: string;
    actividad_titulo: string | null;
  }>;
}

export interface RankingUsuario {
  id: number;
  nombre: string;
  avatar_url: string | null;
  xp_total: number;
  nivel: number;
  nivel_titulo: string;
  nivel_icono: string;
  posicion: number;
}

export interface ApiError {
  error: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }

  // ==================== AUTENTICACIÓN ====================

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: data.role || 'student' }),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(userId: number) {
    return this.request(`/users/${userId}`, {
      method: 'GET',
    });
  }

  async updateProfile(userId: number, data: { nombre?: string; correo?: string; avatar_url?: string; titulo?: string }) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(userId: number, data: { current_password: string; new_password: string }) {
    return this.request(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Lecciones
  async crearLeccion(data: {
    titulo: string;
    descripcion: string;
    contenido: string;
    imagen_url?: string;
    preguntas?: Array<{
      pregunta: string;
      opciones: string[];
      respuesta_correcta: number | string;
    }>;
  }): Promise<{ id: number; message: string }> {
    return this.request('/lecciones/crear', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async obtenerLecciones(): Promise<Array<{
    id: number;
    titulo: string;
    descripcion: string;
    contenido: string;
    imagen_url?: string;
  }>> {
    return this.request('/lecciones', {
      method: 'GET',
    });
  }

  async actualizarLeccion(id: number, data: {
    titulo?: string;
    descripcion?: string;
    contenido?: string;
    imagen_url?: string;
  }): Promise<{ message: string }> {
    return this.request(`/lecciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTeachers(): Promise<Array<{
    id: number;
    nombre: string;
    correo: string;
  }>> {
    return this.request('/users/teachers', {
      method: 'GET',
    });
  }

  // ==================== SISTEMA DE XP ====================

  // Otorgar XP a un usuario
  async otorgarXP(
    usuario_id: number,
    cantidad: number,
    tipo: 'actividad_completada' | 'respuesta_correcta' | 'racha_diaria' | 'insignia' | 'bonus_profesor' | 'penalizacion',
    descripcion?: string,
    actividad_id?: number
  ): Promise<XPResponse> {
    return this.request<XPResponse>('/xp/otorgar', {
      method: 'POST',
      body: JSON.stringify({ usuario_id, cantidad, tipo, descripcion, actividad_id }),
    });
  }

  // Obtener perfil completo de XP
  async obtenerPerfilXP(usuario_id: number): Promise<PerfilXPResponse> {
    return this.request<PerfilXPResponse>(`/xp/perfil/${usuario_id}`, {
      method: 'GET',
    });
  }

  // Obtener ranking
  async obtenerRanking(role: 'student' | 'teacher' = 'student', limit: number = 10): Promise<RankingUsuario[]> {
    return this.request<RankingUsuario[]>(`/xp/ranking?role=${role}&limit=${limit}`, {
      method: 'GET',
    });
  }

  // Actualizar racha diaria
  async actualizarRacha(usuario_id: number): Promise<{ message: string; racha_actual: number; xp_ganado: number }> {
    return this.request('/xp/racha', {
      method: 'POST',
      body: JSON.stringify({ usuario_id }),
    });
  }

  // Obtener todos los niveles
  async obtenerNiveles(): Promise<Array<{
    nivel: number;
    xp_minimo: number;
    xp_maximo: number;
    titulo: string;
    icono: string;
  }>> {
    return this.request('/xp/niveles', {
      method: 'GET',
    });
  }

  // ==================== RETOS Y COMPETENCIAS ====================

  // Crear un reto
  async crearReto(data: {
    titulo: string;
    descripcion: string;
    tipo: 'individual' | 'competition';
    xp_recompensa: number;
    fecha_fin: string;
    max_intentos: number;
    preguntas?: Array<{
      pregunta: string;
      opciones: string[];
      respuesta_correcta: number | string;
    }>;
  }): Promise<{ id: number; message: string }> {
    return this.request('/retos/crear', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Obtener retos activos
  async obtenerRetosActivos(): Promise<Array<{
    id: number;
    titulo: string;
    descripcion: string;
    tipo: 'individual' | 'competition';
    xp_recompensa: number;
    participantes: number;
    estado: 'active' | 'completed';
    fecha_fin: string;
    creador_id: number;
  }>> {
    return this.request('/retos/activos', {
      method: 'GET',
    });
  }

  // Unirse a un reto
  async unirseReto(reto_id: number): Promise<{ message: string }> {
    return this.request('/retos/unirse', {
      method: 'POST',
      body: JSON.stringify({ reto_id }),
    });
  }

  // Completar un reto
  async completarReto(reto_id: number): Promise<{ message: string; xp_ganado: number }> {
    return this.request('/retos/completar', {
      method: 'POST',
      body: JSON.stringify({ reto_id }),
    });
  }

  // ==================== RETOS ====================

  // Obtener preguntas de un reto
  async obtenerPreguntasReto(reto_id: number): Promise<Array<{
    id: number;
    pregunta: string;
    opciones: string[];
  }>> {
    return this.request(`/retos/${reto_id}/preguntas`, {
      method: 'GET',
    });
  }

  // Verificar respuesta de una pregunta
  async verificarRespuestaReto(reto_id: number, pregunta_id: number, respuesta: string): Promise<{ correcta: boolean; respuesta_correcta?: string }> {
    return this.request(`/retos/${reto_id}/verificar`, {
      method: 'POST',
      body: JSON.stringify({ pregunta_id, respuesta }),
    });
  }

  // Enviar respuestas de un reto
  async enviarRespuestasReto(reto_id: number, respuestas: Array<{
    pregunta_id: number;
    respuesta: string;
  }>): Promise<{ message: string; correctas: number; total: number; xp_ganado: number }> {
    return this.request(`/retos/${reto_id}/responder`, {
      method: 'POST',
      body: JSON.stringify({ respuestas }),
    });
  }

  // ==================== LECCIONES ====================

  // Completar una lección
  async completarLeccion(leccion_id: number, puntuacion: number, total_preguntas: number): Promise<{ message: string; xp_ganado: number }> {
    return this.request('/lecciones/completar', {
      method: 'POST',
      body: JSON.stringify({ leccion_id, puntuacion, total_preguntas }),
    });
  }

  // ==================== REPORTES ====================

  // Obtener reportes de rendimiento por lección
  async obtenerReportesLecciones(): Promise<Array<{
    id: number;
    titulo: string;
    promedio_puntuacion: number;
    tasa_completitud: number;
    total_estudiantes: number;
    estudiantes: Array<{
      nombre: string;
      avatar_url: string;
      puntuacion: number;
      estado: 'completado' | 'en_progreso' | 'no_iniciado';
    }>;
    preguntas_dificiles: Array<{
      pregunta: string;
      tasa_error: number;
    }>;
  }>> {
    return this.request('/reportes/lecciones', {
      method: 'GET',
    });
  }

  // Obtener detalles de rendimiento de una lección específica
  async obtenerDetalleLeccion(leccion_id: number): Promise<{
    leccion: {
      id: number;
      titulo: string;
      descripcion: string;
    };
    estadisticas: {
      promedio_general: number;
      tasa_completitud: number;
      tiempo_promedio: number;
      distribucion_puntuaciones: {
        excelente: number; // 80-100
        bueno: number;     // 60-79
        regular: number;   // 40-59
        deficiente: number; // 0-39
      };
    };
    estudiantes: Array<{
      id: number;
      nombre: string;
      avatar_url: string;
      puntuacion: number;
      tiempo_completado: number;
      fecha_completado: string;
      respuestas: Array<{
        pregunta_id: number;
        correcta: boolean;
        tiempo_respuesta: number;
      }>;
    }>;
    analisis_preguntas: Array<{
      pregunta_id: number;
      pregunta_texto: string;
      dificultad: 'facil' | 'medio' | 'dificil';
      tasa_aciertos: number;
      tiempo_promedio: number;
      estudiantes_errores: number[];
    }>;
  }> {
    return this.request(`/reportes/lecciones/${leccion_id}`, {
      method: 'GET',
    });
  }

  // ==================== GESTIÓN DE CLASE ====================

  // Obtener progreso de estudiantes para docente
  async obtenerProgresoEstudiantes(): Promise<Array<{
    id: number;
    nombre: string;
    avatar_url: string;
    nivel: number;
    xp_total: number;
    progreso_general: number;
    progreso_por_tema: Array<{
      tema: string;
      progreso: number;
    }>;
    ultima_actividad: string;
    estado_activo: boolean;
  }>> {
    return this.request('/teacher/students/progress', {
      method: 'GET',
    });
  }

  // Obtener detalles de progreso de un estudiante específico
  async obtenerProgresoEstudianteDetalle(estudiante_id: number): Promise<{
    estudiante: {
      id: number;
      nombre: string;
      avatar_url: string;
      nivel: number;
      xp_total: number;
    };
    progreso_general: number;
    progreso_por_tema: Array<{
      tema: string;
      progreso: number;
      lecciones_completadas: number;
      total_lecciones: number;
    }>;
    retos_completados: number;
    retos_totales: number;
    ultima_actividad: string;
    tiempo_estudiado: number; // en minutos
  }> {
    return this.request(`/teacher/students/${estudiante_id}/progress`, {
      method: 'GET',
    });
  }

  // ==================== STORAGE LOCAL ====================

  saveAuth(token: string, user: AuthResponse['user']): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): AuthResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const apiService = new ApiService(API_URL);
export default apiService;