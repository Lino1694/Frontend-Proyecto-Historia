import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Snackbar, Alert } from '@mui/material';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import { ProgressBar } from '../shared/ProgressBar';

interface Message { text: string; isBot: boolean; }

const viceroyaltyInfo = {
  general: "Las Rebeliones fueron levantamientos indígenas y criollos contra el colonialismo, destacando la de Túpac Amaru II y Micaela Bastidas en 1780.",
  administracion: "Las rebeliones ocurrieron en diferentes regiones: Túpac Amaru II en Cusco-Puno, Pumacahua en Ayacucho, los moxos en Bolivia y los chunchos en la selva.",
  economia: "Las causas principales fueron los nuevos impuestos, la mita forzada en minas y la explotación de los recursos por parte de la burguesía criolla.",
  legado: "Las rebeliones abrieron el camino a la independencia al demostrar la capacidad de resistencia y crear conciencia criolla sobre la opresión colonial."
};

const ViceroyaltyPeriod: React.FC = () => {
   const [messages, setMessages] = useState<Message[]>([{ text: "¡Hola! Soy tu guía sobre las Rebeliones. Pregunta sobre: historia, regiones, causas o legado.", isBot: true }]);
   const [input, setInput] = useState('');

   const { progress, addProgress } = useClassProgress();
   const [notifOpen, setNotifOpen] = useState(false);
   const [notifMsg, setNotifMsg] = useState('');

   const handleSend = () => {
     if (!input.trim()) return;
     setMessages(prev => [...prev, { text: input, isBot: false }]);

     let response = '';
     const lower = input.toLowerCase();
     let matched = false;

     if (lower.includes('historia') || lower.includes('general')) { response = viceroyaltyInfo.general; matched = true; }
     else if (lower.includes('region') || lower.includes('tupac') || lower.includes('moxos') || lower.includes('chunchos')) { response = viceroyaltyInfo.administracion; matched = true; }
     else if (lower.includes('causa') || lower.includes('impuesto') || lower.includes('mita')) { response = viceroyaltyInfo.economia; matched = true; }
     else if (lower.includes('legado') || lower.includes('independencia')) { response = viceroyaltyInfo.legado; matched = true; }
     else { response = "No entendí, intenta preguntar sobre historia, regiones, causas o legado."; }

     if (matched) {
       const progressAdded = addProgress('rebeliones', 10);
       if (progressAdded) {
         setNotifMsg('+10% Progreso en Rebeliones');
         setNotifOpen(true);
       }
     }

     setTimeout(() => setMessages(prev => [...prev, { text: response, isBot: true }]), 400);
     setInput('');
   };

   return (
     <Box sx={{ maxWidth: { xs: 600, lg: 800 }, margin: '0 auto', p: 2 }}>
       <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
         <Typography variant="h5" gutterBottom>Rebeliones</Typography>

         <Box sx={{ mb: 2 }}>
           <Typography variant="body2" sx={{ mb: 1 }}>Progreso de la clase</Typography>
           <ProgressBar progress={progress['rebeliones'] ?? 0} />
           <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>{progress['rebeliones'] ?? 0}%</Typography>
         </Box>

         <Box sx={{ height: { xs: 400, lg: 500 }, overflow: 'auto', mb: 2 }}>
           <List>
             {messages.map((m, i) => (
               <ListItem key={i} sx={{ justifyContent: m.isBot ? 'flex-start' : 'flex-end' }}>
                 <Paper sx={{ p: 1, backgroundColor: m.isBot ? '#e3f2fd' : '#e8f5e9', maxWidth: '80%' }}>
                   <Typography>{m.text}</Typography>
                 </Paper>
               </ListItem>
             ))}
           </List>
         </Box>

         <Box sx={{ display: 'flex', gap: 1 }}>
           <TextField fullWidth value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Haz una pregunta sobre las rebeliones..." />
           <Button variant="contained" onClick={handleSend}>Enviar</Button>
         </Box>
       </Paper>

       <Snackbar open={notifOpen} autoHideDuration={1800} onClose={() => setNotifOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
         <Alert onClose={() => setNotifOpen(false)} severity="success" sx={{ width: '100%' }}>{notifMsg}</Alert>
       </Snackbar>
     </Box>
   );
 };

export default ViceroyaltyPeriod;

