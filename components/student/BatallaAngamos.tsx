import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Snackbar, Alert } from '@mui/material';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import { ProgressBar } from '../shared/ProgressBar';

interface Message { text: string; isBot: boolean; }

const batallaInfo = {
  general: "La Batalla de Angamos (8 de octubre de 1879) fue un enfrentamiento naval clave durante la Guerra del Pacífico; resultó en la derrota de la Esmeralda y la captura del monitor Huáscar por Chile.",
  contexto: "La batalla formó parte de la disputa por control marítimo entre Chile, Perú y Bolivia durante la Guerra del Pacífico (1879-1884).",
  consecuencias: "La captura del Huáscar debilitó la capacidad naval peruana y tuvo impacto estratégico en el conflicto.",
};

const BatallaAngamos: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{ text: "Pregunta sobre la Batalla de Angamos: contexto, consecuencias o detalles generales.", isBot: true }]);
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

    if (lower.includes('historia') || lower.includes('general') || lower.includes('angamos')) { response = batallaInfo.general; matched = true; }
    else if (lower.includes('context') || lower.includes('guerra') || lower.includes('pacifico')) { response = batallaInfo.contexto; matched = true; }
    else if (lower.includes('consecu') || lower.includes('impact') || lower.includes('resultado')) { response = batallaInfo.consecuencias; matched = true; }
    else { response = "No entendí, intenta preguntar sobre contexto, consecuencias o detalles generales."; }

    if (matched) {
      const progressAdded = addProgress('batalla-angamos', 10);
      if (progressAdded) {
        setNotifMsg('+10% Progreso en La Batalla de Angamos');
        setNotifOpen(true);
      }
    }

    setTimeout(() => setMessages(prev => [...prev, { text: response, isBot: true }]), 400);
    setInput('');
  };

  return (
    <Box sx={{ maxWidth: { xs: 600, lg: 800 }, margin: '0 auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>La Batalla de Angamos</Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Progreso de la clase</Typography>
          <ProgressBar progress={progress['batalla-angamos'] ?? 0} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>{progress['batalla-angamos'] ?? 0}%</Typography>
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
          <TextField fullWidth value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Haz una pregunta sobre la Batalla de Angamos..." />
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