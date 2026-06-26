import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Snackbar, Alert } from '@mui/material';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import { ProgressBar } from '../shared/ProgressBar';

interface Message { text: string; isBot: boolean; }

const batallaInfo = {
  general: "La Independencia y Consolidación del Perú fue el proceso que llevó a la separación del virreinato español, culminando con la Batalla de Ayacucho en 1824.",
  contexto: "José de San Martín desembarcó en Paracas en 1820 y proclamó la independencia el 28 de julio de 1821. Luego llegó Antonio José de Sucre para la batalla final.",
  consecuencias: "La Batalla de Ayacucho (6 de agosto de 1824) puso fin al dominio español. La capitulación del 9 de diciembre selló la independencia total del Perú.",
};

const BatallaAngamos: React.FC = () => {
   const [messages, setMessages] = useState<Message[]>([{ text: "Pregunta sobre la Independencia y Consolidación: contexto, batallas o detalles generales.", isBot: true }]);
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

     if (lower.includes('historia') || lower.includes('general') || lower.includes('independencia')) { response = batallaInfo.general; matched = true; }
     else if (lower.includes('context') || lower.includes('san martin') || lower.includes('sucre') || lower.includes('ayacucho')) { response = batallaInfo.contexto; matched = true; }
     else if (lower.includes('consecu') || lower.includes('ayacucho') || lower.includes('capitulacion') || lower.includes('final')) { response = batallaInfo.consecuencias; matched = true; }
     else { response = "No entendí, intenta preguntar sobre contexto, batallas o detalles generales."; }

     if (matched) {
       const progressAdded = addProgress('consolidacion', 10);
       if (progressAdded) {
         setNotifMsg('+10% Progreso en Consolidación');
         setNotifOpen(true);
       }
     }

     setTimeout(() => setMessages(prev => [...prev, { text: response, isBot: true }]), 400);
     setInput('');
   };

   return (
     <Box sx={{ maxWidth: { xs: 600, lg: 800 }, margin: '0 auto', p: 2 }}>
       <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
         <Typography variant="h5" gutterBottom>Independencia y Consolidación</Typography>

         <Box sx={{ mb: 2 }}>
           <Typography variant="body2" sx={{ mb: 1 }}>Progreso de la clase</Typography>
           <ProgressBar progress={progress['consolidacion'] ?? 0} />
           <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>{progress['consolidacion'] ?? 0}%</Typography>
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
           <TextField fullWidth value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Haz una pregunta sobre la Independencia y Consolidación..." />
           <Button variant="contained" onClick={handleSend}>Enviar</Button>
         </Box>
       </Paper>

       <Snackbar open={notifOpen} autoHideDuration={1800} onClose={() => setNotifOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
         <Alert onClose={() => setNotifOpen(false)} severity="success" sx={{ width: '100%' }}>{notifMsg}</Alert>
       </Snackbar>
     </Box>
   );
 };

export default BatallaAngamos;
