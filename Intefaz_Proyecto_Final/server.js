const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;

// IP de tu Arduino (ajusta según tu configuración)
const ARDUINO_IP = '192.168.10.31';
const ARDUINO_PORT = 80;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para enviar solicitud al Arduino
app.post('/dispense', async (req, res) => {
    try {
        const { ml } = req.body;
        
        if (!ml || ml <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cantidad inválida' 
            });
        }

        // Enviar solicitud al Arduino
        const arduinoUrl = `http://${ARDUINO_IP}:${ARDUINO_PORT}/?ml=${ml}`;
        console.log(`Enviando solicitud a: ${arduinoUrl}`);
        
        const response = await axios.get(arduinoUrl, {
            timeout: 5000 // 5 segundos de timeout
        });

        res.json({ 
            success: true, 
            message: `Solicitud enviada: ${ml} mL`,
            status: 'Esperando activación (pulsador o chasquido)'
        });

    } catch (error) {
        console.error('Error al comunicarse con Arduino:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Error de comunicación con el dispensador',
            error: error.message 
        });
    }
});

// Ruta para verificar estado del Arduino
app.get('/status', async (req, res) => {
    try {
        const arduinoUrl = `http://${ARDUINO_IP}:${ARDUINO_PORT}/`;
        const response = await axios.get(arduinoUrl, {
            timeout: 3000
        });
        
        res.json({ 
            success: true, 
            message: 'Arduino conectado',
            online: true 
        });
    } catch (error) {
        res.json({ 
            success: false, 
            message: 'Arduino no disponible',
            online: false 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📡 Conectando con Arduino en ${ARDUINO_IP}:${ARDUINO_PORT}`);
});