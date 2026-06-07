import React, { useState, useEffect } from 'react';
import { Card } from '../shared/Card';
import { apiService } from '../../services/api';

interface RewardsCenterProps {
     onBack: () => void;
 }
 
 interface Student {
     id: number;
     nombre: string;
     avatar_url: string;
     xp_total: number;
     nivel: number;
 }
 
 interface Insignia {
     id: number;
     nombre: string;
     descripcion: string;
     icono: string;
     color: string;
     xp_requerido: number;
     criterio?: {
         tipo: 'xp_minimo' | 'nivel_minimo' | 'respuestas_correctas' | 'actividades_completadas';
         valor: number;
     };
 }
 
 const RewardsCenter: React.FC<RewardsCenterProps> = ({ onBack }) => {
     const [students, setStudents] = useState<Student[]>([]);
     const [insignias, setInsignias] = useState<Insignia[]>([]);
     const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
     const [loading, setLoading] = useState(false);
     const [extraPoints, setExtraPoints] = useState('');
     const [pointsReason, setPointsReason] = useState('');
     const [selectedInsignia, setSelectedInsignia] = useState<Insignia | null>(null);
     const [showCriterios, setShowCriterios] = useState(false);
     const [criterioTipo, setCriterioTipo] = useState<'xp_minimo' | 'nivel_minimo' | 'respuestas_correctas' | 'actividades_completadas'>('xp_minimo');
     const [criterioValor, setCriterioValor] = useState('');
 
     useEffect(() => {
         const fetchData = async () => {
             try {
                 const [studentsData, insigniasData] = await Promise.all([
                     apiService.obtenerProgresoEstudiantes(),
                     apiService.obtenerInsignias()
                 ]);
                 setStudents(studentsData.map(s => ({
                     id: s.id,
                     nombre: s.nombre,
                     avatar_url: s.avatar_url,
                     xp_total: s.xp_total,
                     nivel: s.nivel
                 })));
                 setInsignias(insigniasData);
             } catch (error) {
                 console.error('Error fetching rewards data:', error);
             }
         };
         fetchData();
     }, []);
 
     const handleGivePoints = async () => {
         if (!selectedStudent || !extraPoints) return;
         
         setLoading(true);
         try {
             await apiService.otorgarXP(
                 selectedStudent.id,
                 parseInt(extraPoints),
                 'bonus_profesor',
                 pointsReason || 'Puntos extras otorgados por el profesor'
             );
             setSelectedStudent(null);
             setExtraPoints('');
             setPointsReason('');
         } catch (error) {
             console.error('Error giving points:', error);
             alert('Error al otorgar puntos');
         } finally {
             setLoading(false);
         }
     };
 
     const handleGiveInsignia = async () => {
         if (!selectedStudent || !selectedInsignia) return;
         
         setLoading(true);
         try {
             await apiService.otorgarInsignia(
                 selectedStudent.id,
                 selectedInsignia.id,
                 'Insignia otorgada por el profesor'
             );
             setSelectedStudent(null);
             setSelectedInsignia(null);
         } catch (error) {
             console.error('Error giving insignia:', error);
             alert('Error al otorgar insignia');
         } finally {
             setLoading(false);
         }
     };
 
     const handleConfigCriterios = async () => {
         if (!selectedInsignia || !criterioValor) return;
         
         setLoading(true);
         try {
             await apiService.configurarCriteriosInsignia(
                 selectedInsignia.id,
                 { tipo: criterioTipo, valor: parseInt(criterioValor) }
             );
             alert('Criterio configurado exitosamente');
             setShowCriterios(false);
             const insigniasData = await apiService.obtenerInsignias();
             setInsignias(insigniasData);
         } catch (error) {
             console.error('Error configuring criterio:', error);
             alert('Error al configurar criterio');
         } finally {
             setLoading(false);
         }
     };
 
     return (
         <div className="flex-1 overflow-y-auto bg-brand-cream">
             <header className="p-4 bg-brand-offwhite shadow-sm flex items-center sticky top-0 z-10">
                 <button onClick={onBack} className="font-bold text-2xl text-slate-600">&lt;</button>
                 <h1 className="text-xl font-bold text-center text-slate-800 flex-1">Insignias y Puntos Extras</h1>
             </header>
             
             <div className="p-4 space-y-6">
                 <Card>
                     <h2 className="text-lg font-bold text-slate-700 mb-3">Configurar Criterios de Insignias</h2>
                     <div className="space-y-3">
                         {insignias.map(insignia => (
                             <div key={insignia.id} className="flex items-center justify-between p-2 rounded-lg bg-brand-cream">
                                 <div className="flex items-center">
                                     <span className="text-2xl mr-2">{insignia.icono}</span>
                                     <div>
                                         <span className="font-semibold text-slate-800">{insignia.nombre}</span>
                                         <div className="text-xs text-slate-500">
                                             {insignia.criterio ? `Criterio: ${insignia.criterio.tipo} = ${insignia.criterio.valor}` : 'Sin criterio'}
                                         </div>
                                     </div>
                                 </div>
                                 <button 
                                     onClick={() => { setSelectedInsignia(insignia); setShowCriterios(true); }}
                                     className="bg-brand-green/20 text-brand-green font-bold py-1 px-3 rounded-lg text-xs hover:bg-brand-green/30 transition-colors">
                                     Configurar
                                 </button>
                             </div>
                         ))}
                     </div>
                 </Card>
 
                 <Card>
                     <h2 className="text-lg font-bold text-slate-700 mb-3">Seleccionar Estudiante</h2>
                     <ul className="space-y-3">
                         {students.map(student => (
                             <li key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-brand-cream">
                                 <div className="flex items-center">
                                     <img src={student.avatar_url} alt={student.nombre} className="w-10 h-10 rounded-full mr-3 object-cover bg-brand-yellow-orange"/>
                                     <div>
                                         <span className="font-semibold text-slate-800">{student.nombre}</span>
                                         <div className="text-xs text-slate-500">Nivel {student.nivel} - {student.xp_total} XP</div>
                                     </div>
                                 </div>
                                 <button 
                                     onClick={() => setSelectedStudent(student)}
                                     className="bg-brand-green text-white font-bold py-1.5 px-4 rounded-lg hover:bg-brand-dark-green transition-colors text-sm">
                                     Premiar
                                 </button>
                             </li>
                         ))}
                     </ul>
                 </Card>
             </div>
 
             {selectedStudent && (
                 <div className="absolute inset-0 bg-black/50 flex items-end justify-center z-20 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}>
                     <div className="bg-brand-offwhite rounded-t-2xl p-6 shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                         <div className="flex justify-between items-center mb-4">
                             <h2 className="text-lg font-bold text-slate-800">Premiar a {selectedStudent.nombre}</h2>
                             <button onClick={() => setSelectedStudent(null)} className="font-bold text-2xl text-slate-500">&times;</button>
                         </div>
 
                         <div className="space-y-4">
                             <div>
                                 <h3 className="text-sm font-bold text-slate-700 mb-2">Otorgar Insignias</h3>
                                 <div className="grid grid-cols-3 gap-3 text-center">
                                     {insignias.map(insignia => (
                                         <button 
                                             key={insignia.id} 
                                             onClick={() => setSelectedInsignia(insignia)}
                                             className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                                                 selectedInsignia?.id === insignia.id 
                                                     ? 'bg-brand-dark-green/20 ring-2 ring-brand-dark-green' 
                                                     : 'bg-brand-cream hover:bg-brand-yellow-orange'
                                             }`}
                                         >
                                             <div className="text-3xl p-2 bg-brand-cream rounded-full">{insignia.icono}</div>
                                             <span className="text-xs font-semibold mt-1 text-slate-700">{insignia.nombre}</span>
                                         </button>
                                     ))}
                                 </div>
                                 <button 
                                     onClick={handleGiveInsignia}
                                     disabled={!selectedInsignia || loading}
                                     className="w-full mt-3 bg-brand-green text-white font-bold py-2 rounded-lg disabled:opacity-50"
                                 >
                                     {loading ? 'Otorgando...' : 'Otorgar Insignia'}
                                 </button>
                             </div>
 
                             <div>
                                 <h3 className="text-sm font-bold text-slate-700 mb-2">Otorgar Puntos Extras (XP)</h3>
                                 <div>
                                     <label htmlFor="extra-points" className="block text-xs font-bold text-slate-600 mb-1">Cantidad de Puntos</label>
                                     <input 
                                         type="number" 
                                         id="extra-points" 
                                         value={extraPoints}
                                         onChange={(e) => setExtraPoints(e.target.value)}
                                         placeholder="Ej: 50" 
                                         className="w-full px-4 py-2 rounded-lg bg-brand-cream text-center focus:outline-none focus:ring-2 focus:ring-brand-green" 
                                     />
                                 </div>
                                 <div className="mt-2">
                                     <label htmlFor="reason" className="block text-xs font-bold text-slate-600 mb-1">Motivo (opcional)</label>
                                     <input 
                                         type="text" 
                                         id="reason" 
                                         value={pointsReason}
                                         onChange={(e) => setPointsReason(e.target.value)}
                                         placeholder="Ej: Excelente participación" 
                                         className="w-full px-4 py-2 rounded-lg bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-green" 
                                     />
                                 </div>
                                 <button 
                                     onClick={handleGivePoints}
                                     disabled={!extraPoints || loading}
                                     className="w-full mt-3 bg-brand-green text-white font-bold py-2 rounded-lg disabled:opacity-50"
                                 >
                                     {loading ? 'Otorgando...' : 'Otorgar Puntos'}
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {showCriterios && selectedInsignia && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 backdrop-blur-sm" onClick={() => setShowCriterios(false)}>
                     <div className="bg-brand-offwhite rounded-2xl p-6 shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                         <h2 className="text-lg font-bold text-slate-800 mb-4">Configurar Criterio: {selectedInsignia.nombre}</h2>
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Criterio</label>
                                 <select
                                     value={criterioTipo}
                                     onChange={(e) => setCriterioTipo(e.target.value as any)}
                                     className="w-full px-3 py-2 rounded-lg bg-brand-cream"
                                 >
                                     <option value="xp_minimo">XP Mínimo</option>
                                     <option value="nivel_minimo">Nivel Mínimo</option>
                                     <option value="respuestas_correctas">Respuestas Correctas</option>
                                     <option value="actividades_completadas">Actividades Completadas</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-600 mb-1">Valor Requerido</label>
                                 <input
                                     type="number"
                                     value={criterioValor}
                                     onChange={(e) => setCriterioValor(e.target.value)}
                                     placeholder="Ej: 100"
                                     className="w-full px-3 py-2 rounded-lg bg-brand-cream"
                                 />
                             </div>
                             <button
                                 onClick={handleConfigCriterios}
                                 disabled={loading || !criterioValor}
                                 className="w-full bg-brand-green text-white font-bold py-2 rounded-lg disabled:opacity-50"
                             >
                                 {loading ? 'Configurando...' : 'Guardar Criterio'}
                             </button>
                         </div>
                     </div>
                 </div>
             )}
         </div>
     );
 };
 
 export default RewardsCenter;
