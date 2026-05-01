import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Snackbar, Alert } from '@mui/material';
import { useClassProgress } from '../../contexts/ClassProgressContext'; // <-- añadido
import { ProgressBar } from '../shared/ProgressBar'; // <-- añadido

interface Message {
  text: string;
  isBot: boolean;
}

const caralInfo = {
  general: "Caral es la ciudad más antigua de América, ubicada en el valle de Supe, Perú. Fue construida hace aproximadamente 5,000 años (alrededor del 2600 a.C.) por la civilización Caral, siendo contemporánea a las primeras ciudades de Mesopotamia y Egipto. Es Patrimonio Mundial de la UNESCO desde 2009.",
  descubrimiento: "Fue descubierta en 1948 por el arqueólogo peruano Julio C. Tello, pero su importancia como la ciudad más antigua de América fue reconocida recién en las excavaciones de los años 1990 dirigidas por Ruth Shady. Las excavaciones continúan revelando más secretos de esta fascinante civilización.",
  arquitectura: "Caral cuenta con seis pirámides monumentales, plazas circulares, templos y residencias. La Pirámide Mayor mide 18 metros de altura y 150 metros de diámetro. Todas las construcciones usan piedra y adobe, con técnicas avanzadas de ingeniería que incluyen ventilación y drenaje.",
  sociedad: "La sociedad caral era pacífica y organizada jerárquicamente. No tenían armas ni fortificaciones, lo que sugiere una sociedad igualitaria. Practicaban el trueque y el comercio a larga distancia. Tenían una élite religiosa que dirigía los rituales y la construcción.",
  economia: "La economía se basaba en la agricultura (algodón, calabaza, frijoles, maíz), pesca y recolección. Desarrollaron sistemas de irrigación avanzados y domesticaron plantas. Comerciaban con otras culturas a lo largo de la costa peruana.",
  religion: "La religión era central en Caral, con templos dedicados a deidades relacionadas con la fertilidad y la agricultura. Encontraron instrumentos musicales como flautas de hueso y trompetas, sugiriendo que la música formaba parte de los rituales. No hay evidencia de sacrificios humanos.",
  legado: "Caral demuestra que las civilizaciones americanas se desarrollaron de manera independiente y sofisticada. Su legado incluye el desarrollo de la agricultura, la arquitectura monumental y sistemas sociales complejos que influyeron en culturas posteriores como los incas."
};

const CaralCity: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    text: "¡Hola! Soy un habitante de Caral, la ciudad más antigua de América. ¿Qué te gustaría saber sobre nuestra gran civilización? Puedes preguntarme sobre:\n- Historia general\n- Descubrimiento arqueológico\n- Arquitectura y monumentos\n- Sociedad y organización\n- Economía\n- Religión y rituales\n- Legado cultural",
    isBot: true
  }]);
  const [input, setInput] = useState('');

  const { progress, addProgress } = useClassProgress(); // usar progress y addProgress

  // estado para notificación
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    // agregar mensaje del usuario usando updater funcional
    setMessages(prev => [...prev, { text: input, isBot: false }]);

    // Simple response logic
    let response = '';
    const lowerInput = input.toLowerCase();
    let matched = false;

    if (lowerInput.includes('historia') || lowerInput.includes('general')) {
      response = caralInfo.general;
      matched = true;
    } else if (lowerInput.includes('descubrimiento') || lowerInput.includes('arqueolog')) {
      response = caralInfo.descubrimiento;
      matched = true;
    } else if (lowerInput.includes('arquitectura') || lowerInput.includes('monumento') || lowerInput.includes('piramide')) {
      response = caralInfo.arquitectura;
      matched = true;
    } else if (lowerInput.includes('sociedad') || lowerInput.includes('organiza')) {
      response = caralInfo.sociedad;
      matched = true;
    } else if (lowerInput.includes('econom') || lowerInput.includes('agricultura')) {
      response = caralInfo.economia;
      matched = true;
    } else if (lowerInput.includes('religi') || lowerInput.includes('ritual') || lowerInput.includes('musica')) {
      response = caralInfo.religion;
      matched = true;
    } else if (lowerInput.includes('legado') || lowerInput.includes('influencia')) {
      response = caralInfo.legado;
      matched = true;
    } else {
      response = "No entendí tu pregunta. ¿Podrías reformularla? Puedes preguntar sobre historia general, descubrimiento, arquitectura, sociedad, economía, religión o legado de Caral.";
    }

    // Si hubo un match válido, sumar progreso y mostrar notificación
    if (matched) {
      const progressAdded = addProgress('caral-ciudad', 10); // incrementa 10% por consulta acertada
      if (progressAdded) {
        setNotifMsg('+10% Progreso en Caral');
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
          Caral - La Primera Ciudad
        </Typography>

        {/* Barra de progreso en tiempo real */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Progreso de la clase</Typography>
          <ProgressBar progress={progress['caral-ciudad'] ?? 0} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
            {progress['caral-ciudad'] ?? 0}%
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