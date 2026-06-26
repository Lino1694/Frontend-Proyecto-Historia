import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Snackbar, Alert } from '@mui/material';
import { useClassProgress } from '../../contexts/ClassProgressContext'; // <-- añadido
import { ProgressBar } from '../shared/ProgressBar'; // <-- añadido

interface Message {
  text: string;
  isBot: boolean;
}

const caralInfo = {
  general: "El Virreinato del Perú fue creado en 1542 con Lima como capital. Durante casi 300 años, el Perú fue gobernado desde la monarquía española con un sistema administrativo complejo.",
  descubrimiento: "La organización del Virreinato incluyó la creación de intendencias en 1717, la separación del Virreinato del de Nueva Granada y sistemas de recaudación de impuestos más eficientes.",
  arquitectura: "Las construcciones incluyen la Catedral de Lima, el Real Felipe, el Convento de San Francisco y edificios coloniales en el centro histórico. La arquitectura mezcla estilo español con técnicas locales.",
  sociedad: "La sociedad estaba dividida entre españoles peninsulares, criollos, mestizos, indígenas y afroperuanos. Los primeros tenían privilegios políticos y económicos sobre los demás.",
  economia: "La economia se basaba en la minería (especialmente plata de Potosí), el comercio entre España y Lima, y sistemas de encomiendas y mita para el trabajo forzado.",
  religion: "La evangelización fue llevada por ordenes religiosas como franciscanos, dominicos y jesuitas. Se construyeron numerosos templos, conventos y la Catedral de Lima.",
  legado: "El Virreinato dejó un legado cultural, arquitectónico y social que forjó la identidad peruana. Sus instituciones educativas, como la Universidad de San Marcos, siguen vigentes."
};

const CaralCity: React.FC = () => {
   const [messages, setMessages] = useState<Message[]>([{
    text: "¡Hola! Soy un habitante del Virreinato. ¿Qué te gustaría saber sobre este período? Puedes preguntarme sobre:\n- Historia general\n- Organización administrativa\n- Arquitectura y monumentos\n- Sociedad y organización\n- Economía\n- Religión y evangelización\n- Legado cultural",
    isBot: true
  }]);
   const [input, setInput] = useState('');

   const { progress, addProgress } = useClassProgress();

   const [notifOpen, setNotifOpen] = useState(false);
   const [notifMsg, setNotifMsg] = useState('');

   const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, isBot: false }]);

    let response = '';
    const lowerInput = input.toLowerCase();
    let matched = false;

    if (lowerInput.includes('historia') || lowerInput.includes('general')) {
      response = caralInfo.general;
      matched = true;
    } else if (lowerInput.includes('organiza') || lowerInput.includes('administrativa')) {
      response = caralInfo.descubrimiento;
      matched = true;
    } else if (lowerInput.includes('arquitectura') || lowerInput.includes('monumento') || lowerInput.includes('construccion')) {
      response = caralInfo.arquitectura;
      matched = true;
    } else if (lowerInput.includes('sociedad') || lowerInput.includes('organiza') || lowerInput.includes('social')) {
      response = caralInfo.sociedad;
      matched = true;
    } else if (lowerInput.includes('econom') || lowerInput.includes('mineria') || lowerInput.includes('mina')) {
      response = caralInfo.economia;
      matched = true;
    } else if (lowerInput.includes('religi') || lowerInput.includes('evangeliz') || lowerInput.includes('iglesia')) {
      response = caralInfo.religion;
      matched = true;
    } else if (lowerInput.includes('legado') || lowerInput.includes('influencia')) {
      response = caralInfo.legado;
      matched = true;
    } else {
      response = "No entendí tu pregunta. ¿Podrías reformularla? Puedes preguntar sobre historia general, organización administrativa, arquitectura, sociedad, economía, religión o legado del Virreinato.";
    }

    if (matched) {
      const progressAdded = addProgress('organizacion-virreinato', 10);
      if (progressAdded) {
        setNotifMsg('+10% Progreso en Organización del Virreinato');
        setNotifOpen(true);
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 500);

    setInput('');
  };

  return (
    <Box sx={{ maxWidth: { xs: 600, lg: 800 }, margin: '0 auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Organización del Virreinato
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Progreso de la clase</Typography>
          <ProgressBar progress={progress['organizacion-virreinato'] ?? 0} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
            {progress['organizacion-virreinato'] ?? 0}%
          </Typography>
        </Box>

        <Box sx={{ height: { xs: 400, lg: 500 }, overflow: 'auto', mb: 2 }}>
          <List>
            {messages.map((message, index) => (
              <ListItem key={index} sx={{
                justifyContent: message.isBot ? 'flex-start' : 'flex-end',
              }}>
                <Paper sx={{
                  p: 1,
                  backgroundColor: message.isBot ? '#e3f2fd' : '#e8f5e9',
                  maxWidth: '80%'
                }}>
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
            placeholder="Haz una pregunta sobre Caral..."
          />
          <Button variant="contained" onClick={handleSend}>
            Enviar
          </Button>
        </Box>
      </Paper>

      {/* Notificación breve al acertar */}
      <Snackbar open={notifOpen} autoHideDuration={2000} onClose={() => setNotifOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setNotifOpen(false)} severity="success" sx={{ width: '100%' }}>
          {notifMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CaralCity;
