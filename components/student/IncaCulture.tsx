import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Snackbar, Alert } from '@mui/material';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import { ProgressBar } from '../shared/ProgressBar';

interface Message { text: string; isBot: boolean; }

const incaInfo = {
  general: "El Imperio Inca fue la civilización más extensa de Sudamérica precolombina, con capital en Cusco. Destacó por su administración, red de caminos y arquitectura en piedra.",
  organizacion: "Tenían una estructura política y social compleja: el Sapa Inca como gobernante, una élite administrativa y una economía planificada basada en ayllus y trabajos comunitarios.",
  arquitectura: "Destacan construcciones como Machu Picchu, Sacsayhuamán y terrazas agrícolas; empleo de mampostería poligonal y técnicas antisísmicas.",
  legado: "Su legado incluye la ingeniería agrícola, la red vial, conocimientos astronómicos y tradiciones que perduran en la región andina."
};

const IncaCulture: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{ text: "¡Rimaykullayki! Soy tu guía Inca. Pregunta sobre: historia, organización, arquitectura o legado.", isBot: true }]);
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
    else if (lower.includes('organiza') || lower.includes('estructura') || lower.includes('sapa')) { response = incaInfo.organizacion; matched = true; }
    else if (lower.includes('arquitectura') || lower.includes('machu') || lower.includes('sacsay')) { response = incaInfo.arquitectura; matched = true; }
    else if (lower.includes('legado') || lower.includes('herencia')) { response = incaInfo.legado; matched = true; }
    else { response = "No entendí, intenta preguntar sobre historia, organización, arquitectura o legado."; }

    if (matched) {
      const progressAdded = addProgress('cultura-inca', 10);
      if (progressAdded) {
        setNotifMsg('+10% Progreso en La Cultura Inca');
        setNotifOpen(true);
      }
    }

    setTimeout(() => setMessages(prev => [...prev, { text: response, isBot: true }]), 400);
    setInput('');
  };

  return (
    <Box sx={{ maxWidth: { xs: 600, lg: 800 }, margin: '0 auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>La Cultura Inca</Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Progreso de la clase</Typography>
          <ProgressBar progress={progress['cultura-inca'] ?? 0} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>{progress['cultura-inca'] ?? 0}%</Typography>
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
          <TextField fullWidth value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Haz una pregunta sobre la cultura inca..." />
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