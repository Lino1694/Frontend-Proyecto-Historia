import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Snackbar, Alert } from '@mui/material';
import { useClassProgress } from '../../contexts/ClassProgressContext'; // <-- añadido
import { ProgressBar } from '../shared/ProgressBar'; // <-- añadido

interface Message {
  text: string;
  isBot: boolean;
}

const preIncaInfo = {
  general: "Las culturas pre-incaicas fueron civilizaciones que florecieron en los Andes antes del Imperio Inca. Las más destacadas fueron Chavín, Nazca, Moche, Tiahuanaco y Wari.",
  tecnologia: "Desarrollaron técnicas avanzadas de agricultura, sistemas de irrigación, metalurgia y textilería. Los acueductos y terrazas agrícolas son ejemplos de su ingenio.",
  dioses: "Creían en deidades relacionadas con la naturaleza: Inti (sol), Mama Quilla (luna), Viracocha (creador) y Pachamama (tierra). Los rituales y ofrendas eran comunes.",
  arquitectura: "Construyeron grandes centros ceremoniales, ciudadelas y observatorios astronómicos usando técnicas avanzadas de construcción en piedra.",
};

const PreIncaCultures: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    text: "¡Allinllachu! Soy Pachacutec y sere tu guía en el mundo de las culturas pre-incaicas. ¿Qué te gustaría saber? Puedes preguntarme sobre:\n- Historia general\n- Avances tecnológicos\n- Dioses y religión\n- Arquitectura",
    isBot: true
  }]);
  const [input, setInput] = useState('');

  const { progress, addProgress } = useClassProgress();

  // notificación
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, isBot: false }]);

    let response = '';
    const lowerInput = input.toLowerCase();
    let matched = false;

    if (lowerInput.includes('historia') || lowerInput.includes('general')) {
      response = preIncaInfo.general;
      matched = true;
    } else if (lowerInput.includes('tecnolog') || lowerInput.includes('avances') || lowerInput.includes('agricult')) {
      response = preIncaInfo.tecnologia;
      matched = true;
    } else if (lowerInput.includes('dios') || lowerInput.includes('religi')) {
      response = preIncaInfo.dioses;
      matched = true;
    } else if (lowerInput.includes('arquitectura') || lowerInput.includes('construc') || lowerInput.includes('centro')) {
      response = preIncaInfo.arquitectura;
      matched = true;
    } else {
      response = "No entendí tu pregunta. Puedes preguntar sobre historia general, avances tecnológicos, dioses y religión, o arquitectura.";
    }

    if (matched) {
      const progressAdded = addProgress('pre-inca', 10);
      if (progressAdded) {
        setNotifMsg('+10% Progreso en Culturas Pre-Incaicas');
        setNotifOpen(true);
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 400);

    setInput('');
  };

  return (
    <Box sx={{ maxWidth: { xs: 600, lg: 800 }, margin: '0 auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Culturas Pre-Incaicas
        </Typography>

        {/* Barra de progreso */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Progreso de la clase</Typography>
          <ProgressBar progress={progress['pre-inca'] ?? 0} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
            {progress['pre-inca'] ?? 0}%
          </Typography>
        </Box>

        <Box sx={{ height: { xs: 400, lg: 500 }, overflow: 'auto', mb: 2 }}>
          <List>
            {messages.map((message, index) => (
              <ListItem key={index} sx={{ justifyContent: message.isBot ? 'flex-start' : 'flex-end' }}>
                <Paper sx={{ p: 1, backgroundColor: message.isBot ? '#e3f2fd' : '#e8f5e9', maxWidth: '80%' }}>
                  <Typography>{message.text}</Typography>
                </Paper>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Haz una pregunta sobre las culturas pre-incaicas..."
          />
          <Button variant="contained" onClick={handleSend}>
            Enviar
          </Button>
        </Box>
      </Paper>

      <Snackbar open={notifOpen} autoHideDuration={1800} onClose={() => setNotifOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setNotifOpen(false)} severity="success" sx={{ width: '100%' }}>{notifMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PreIncaCultures;
