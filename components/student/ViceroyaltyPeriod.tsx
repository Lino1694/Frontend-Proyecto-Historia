import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Snackbar, Alert } from '@mui/material';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import { ProgressBar } from '../shared/ProgressBar';

interface Message { text: string; isBot: boolean; }

const viceroyaltyInfo = {
  general: "El Virreinato del Perú fue la entidad colonial española que gobernó gran parte de Sudamérica desde el siglo XVI hasta principios del XIX, con Lima como capital.",
  administracion: "Se organizó bajo un virrey y una burocracia colonial que regulaba la economía, la iglesia y el control social; explotó recursos y mano de obra indígena.",
  economia: "Economía basada en minería (plata), agricultura y comercio transatlántico, con sistemas de encomienda y mita que afectaron a la población indígena.",
  legado: "Legado cultural y arquitectónico, además de profundas transformaciones sociales y económicas que influyeron en la independencia posterior."
};

const ViceroyaltyPeriod: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{ text: "Bienvenido al Virreinato. Pregunta sobre: historia, administración, economía o legado.", isBot: true }]);
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
    else if (lower.includes('admin') || lower.includes('virrey') || lower.includes('burocracia')) { response = viceroyaltyInfo.administracion; matched = true; }
    else if (lower.includes('econom') || lower.includes('mineri') || lower.includes('comercio')) { response = viceroyaltyInfo.economia; matched = true; }
    else if (lower.includes('legado') || lower.includes('transform')) { response = viceroyaltyInfo.legado; matched = true; }
    else { response = "No entendí, intenta preguntar sobre historia, administración, economía o legado."; }

    if (matched) {
      const progressAdded = addProgress('virreinato', 10);
      if (progressAdded) {
        setNotifMsg('+10% Progreso en El Virreinato del Perú');
        setNotifOpen(true);
      }
    }

    setTimeout(() => setMessages(prev => [...prev, { text: response, isBot: true }]), 400);
    setInput('');
  };

  return (
    <Box sx={{ maxWidth: { xs: 600, lg: 800 }, margin: '0 auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>El Virreinato del Perú</Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Progreso de la clase</Typography>
          <ProgressBar progress={progress['virreinato'] ?? 0} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>{progress['virreinato'] ?? 0}%</Typography>
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
          <TextField fullWidth value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Haz una pregunta sobre el Virreinato..." />
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
