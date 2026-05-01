import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Snackbar, Alert } from '@mui/material';
import { useClassProgress } from '../../contexts/ClassProgressContext';
import { ProgressBar } from '../shared/ProgressBar';

interface Message { text: string; isBot: boolean; }

const independenceInfo = {
  general: "El proceso de independencia del Perú se consolidó a principios del siglo XIX, con figuras como José de San Martín y Simón Bolívar que impulsaron la emancipación del dominio español.",
  causas: "Causas internas y externas: ideas de la Ilustración, reformas borbónicas, crisis económica y los movimientos independentistas en América.",
  eventos: "Eventos clave: la Expedición libertadora de San Martín, la proclamación de la independencia en 1821 y la batalla de Ayacucho (1824) que aseguró la independencia.",
  legado: "La independencia transformó la estructura política y social, dando paso a repúblicas y nuevos procesos de construcción nacional."
};

const IndependencePeriod: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{ text: "Pregunta sobre la independencia: causas, eventos clave o legado.", isBot: true }]);
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

    if (lower.includes('historia') || lower.includes('general')) { response = independenceInfo.general; matched = true; }
    else if (lower.includes('caus') || lower.includes('ilustr') || lower.includes('reform')) { response = independenceInfo.causas; matched = true; }
    else if (lower.includes('evento') || lower.includes('ayacucho') || lower.includes('proclam')) { response = independenceInfo.eventos; matched = true; }
    else if (lower.includes('legado') || lower.includes('transform')) { response = independenceInfo.legado; matched = true; }
    else { response = "No entendí, intenta preguntar sobre causas, eventos clave o legado."; }

    if (matched) {
      const progressAdded = addProgress('independencia', 10);
      if (progressAdded) {
        setNotifMsg('+10% Progreso en La Independencia');
        setNotifOpen(true);
      }
    }

    setTimeout(() => setMessages(prev => [...prev, { text: response, isBot: true }]), 400);
    setInput('');
  };

  return (
    <Box sx={{ maxWidth: { xs: 600, lg: 800 }, margin: '0 auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>La Independencia</Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Progreso de la clase</Typography>
          <ProgressBar progress={progress['independencia'] ?? 0} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>{progress['independencia'] ?? 0}%</Typography>
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
          <TextField fullWidth value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Haz una pregunta sobre la independencia..." />
          <Button variant="contained" onClick={handleSend}>Enviar</Button>
        </Box>
      </Paper>

      <Snackbar open={notifOpen} autoHideDuration={1800} onClose={() => setNotifOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setNotifOpen(false)} severity="success" sx={{ width: '100%' }}>{notifMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default IndependencePeriod;
