import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Snackbar, Alert } from '@mui/material';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import { ProgressBar } from '../shared/ProgressBar';

interface Message { text: string; isBot: boolean; }

const incaInfo = {
  general: "Las Reformas Borbónicas transformaron el Perú colonial con cambios administrativos y fiscales impuestos por los reyes Borbones.",
  organizacion: "Se crearon las intendencias, se reorganizó la Real Audiencia y se estableció el Real Consulado para controlar el comercio.",
  arquitectura: "Se construyeron nuevas edificaciones administrativas y se reformó la arquitectura urbana en Lima y otros centros.",
  legado: "Las reformas sentaron las bases para la crisis que llevaría a las rebeliones y la independencia del Perú."
};

const IncaCulture: React.FC = () => {
   const [messages, setMessages] = useState<Message[]>([{ text: "¡Hola! Soy tu guía sobre las Reformas Borbónicas. Pregunta sobre: historia, organización, sistemas o legado.", isBot: true }]);
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

     if (lower.includes('historia') || lower.includes('general')) { response = incaInfo.general; matched = true; }
     else if (lower.includes('organiza') || lower.includes('sistema') || lower.includes('intendencia')) { response = incaInfo.organizacion; matched = true; }
     else if (lower.includes('arquitectura') || lower.includes('edificio') || lower.includes('construccion')) { response = incaInfo.arquitectura; matched = true; }
     else if (lower.includes('legado') || lower.includes('herencia')) { response = incaInfo.legado; matched = true; }
     else { response = "No entendí, intenta preguntar sobre historia, organización, arquitectura o legado."; }

     if (matched) {
       const progressAdded = addProgress('reformas-borbonicas', 10);
       if (progressAdded) {
         setNotifMsg('+10% Progreso en Reformas Borbónicas');
         setNotifOpen(true);
       }
     }

     setTimeout(() => setMessages(prev => [...prev, { text: response, isBot: true }]), 400);
     setInput('');
   };

   return (
     <Box sx={{ maxWidth: { xs: 600, lg: 800 }, margin: '0 auto', p: 2 }}>
       <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
         <Typography variant="h5" gutterBottom>Reformas Borbónicas</Typography>

         <Box sx={{ mb: 2 }}>
           <Typography variant="body2" sx={{ mb: 1 }}>Progreso de la clase</Typography>
           <ProgressBar progress={progress['reformas-borbonicas'] ?? 0} />
           <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>{progress['reformas-borbonicas'] ?? 0}%</Typography>
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
           <TextField fullWidth value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Haz una pregunta sobre las reformas borbónicas..." />
           <Button variant="contained" onClick={handleSend}>Enviar</Button>
         </Box>
       </Paper>

       <Snackbar open={notifOpen} autoHideDuration={1800} onClose={() => setNotifOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
         <Alert onClose={() => setNotifOpen(false)} severity="success" sx={{ width: '100%' }}>{notifMsg}</Alert>
       </Snackbar>
     </Box>
   );
 };

export default IncaCulture;
