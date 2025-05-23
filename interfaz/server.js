const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

// Configuración del Arduino
const ARDUINO_IP = '192.168.10.31';
const ARDUINO_URL = `http://${ARDUINO_IP}:80`;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta para obtener datos de los sensores
app.get('/api/sensores', async (req, res) => {
    try {
        const response = await axios.get(`${ARDUINO_URL}/api/sensores`);
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener datos de sensores:', error.message);
        res.status(500).json({ error: 'No se pudo conectar con el Arduino' });
    }
});

// Rutas para controlar el LED
app.get('/api/led', async (req, res) => {
    try {
        const response = await axios.get(`${ARDUINO_URL}/api/led`);
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener estado del LED:', error.message);
        res.status(500).json({ error: 'No se pudo conectar con el Arduino' });
    }
});
app.get('/api/foco', async (req, res) => {
    try {
        const response = await axios.get(`${ARDUINO_URL}/api/foco`);
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener estado del LED:', error.message);
        res.status(500).json({ error: 'No se pudo conectar con el Arduino' });
    }
});

app.post('/api/led/on', async (req, res) => {
    try {
        const response = await axios.post(`${ARDUINO_URL}/api/led/on`);
        res.json(response.data);
    } catch (error) {
        console.error('Error al encender el LED:', error.message);
        res.status(500).json({ error: 'No se pudo conectar con el Arduino' });
    }
});

app.post('/api/led/off', async (req, res) => {
    try {
        const response = await axios.post(`${ARDUINO_URL}/api/led/off`);
        res.json(response.data);
    } catch (error) {
        console.error('Error al apagar el LED:', error.message);
        res.status(500).json({ error: 'No se pudo conectar con el Arduino' });
    }
});

app.post('/api/foco/on', async (req, res) => {
    try {
        const response = await axios.post(`${ARDUINO_URL}/api/foco/on`);
        res.json(response.data);
    } catch (error) {
        console.error('Error al encender el foco:', error.message);
        res.status(500).json({ error: 'No se pudo conectar con el Arduino' });
    }
});

app.post('/api/foco/off', async (req, res) => {
    try {
        const response = await axios.post(`${ARDUINO_URL}/api/foco/off`);
        res.json(response.data);
    } catch (error) {
        console.error('Error al apagar el foco:', error.message);
        res.status(500).json({ error: 'No se pudo conectar con el Arduino' });
    }
});

app.post('/api/ambos/on', async (req, res) => {
    try {
        const response = await axios.post(`${ARDUINO_URL}/api/ambos/on`);
        res.json(response.data);
    } catch (error) {
        console.error('Error al encender ambos:', error.message);
        res.status(500).json({ error: 'No se pudo conectar con el Arduino' });
    }
});

app.post('/api/ambos/off', async (req, res) => {
    try {
        const response = await axios.post(`${ARDUINO_URL}/api/ambos/off`);
        res.json(response.data);
    } catch (error) {
        console.error('Error al apagar ambos:', error.message);
        res.status(500).json({ error: 'No se pudo conectar con el Arduino' });
    }
});

// Ruta para mover el motor - POST con JSON
app.post('/motor', async (req, res) => {
  try {
    const { pasos } = req.body;
    
    if (pasos === undefined) {
      return res.status(400).json({ error: 'Se requiere el valor de pasos' });
    }
    
    // Validar rango
    if (pasos < 0 || pasos > 200) {
      return res.status(400).json({ error: 'Valor de pasos fuera de rango (0-200)' });
    }
    
    // Enviar POST con JSON al Arduino
    const response = await axios.post(`${ARDUINO_URL}/motor`, {
      pasos: pasos
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error al mover el motor:', error.message);
    res.status(500).json({ error: 'No se pudo conectar con el Arduino' });
  }
});
// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});