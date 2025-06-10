const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuración del Arduino
const ARDUINO_IP = '192.168.10.31';
const ARDUINO_PORT = 80;
const ARDUINO_BASE_URL = `http://${ARDUINO_IP}:${ARDUINO_PORT}`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configurar timeout para axios
const axiosConfig = {
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json'
  }
};

// Ruta principal - servir interfaz web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes

// Obtener estado del dosificador
app.get('/api/dosificador/estado', async (req, res) => {
  try {
    console.log('📡 Consultando estado del Arduino...');
    
    const response = await axios.get(
      `${ARDUINO_BASE_URL}/api/dosificador`,
      axiosConfig
    );
    
    console.log('✅ Respuesta del Arduino:', response.data);
    
    res.json({
      success: true,
      arduino: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error consultando Arduino:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error al comunicarse con el Arduino',
      details: error.message,
      arduino_url: ARDUINO_BASE_URL
    });
  }
});

// Dispensar líquido
app.post('/api/dosificador/dispensar', async (req, res) => {
  try {
    const { mililitros } = req.body;
    
    // Validaciones
    if (!mililitros || typeof mililitros !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'El campo "mililitros" es requerido y debe ser un número'
      });
    }
    
    if (mililitros < 0.1 || mililitros > 10) {
      return res.status(400).json({
        success: false,
        error: 'Los mililitros deben estar entre 0.1 y 10'
      });
    }
    
    console.log(`🚰 Solicitando dispensar ${mililitros}ml al Arduino...`);
    
    const response = await axios.post(
      `${ARDUINO_BASE_URL}/api/dosificador/dispensar`,
      { mililitros },
      axiosConfig
    );
    
    console.log('✅ Arduino respondió:', response.data);
    
    res.json({
      success: true,
      message: `Solicitud enviada: ${mililitros}ml`,
      arduino: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error enviando comando al Arduino:', error.message);
    
    if (error.response) {
      // El Arduino respondió con un error
      res.status(error.response.status).json({
        success: false,
        error: 'Error del Arduino',
        arduino_error: error.response.data,
        details: error.message
      });
    } else {
      // Error de conexión
      res.status(500).json({
        success: false,
        error: 'No se pudo conectar con el Arduino',
        details: error.message,
        arduino_url: ARDUINO_BASE_URL
      });
    }
  }
});

// Endpoint para verificar conexión con Arduino
app.get('/api/arduino/ping', async (req, res) => {
  try {
    console.log('🏓 Haciendo ping al Arduino...');
    
    const startTime = Date.now();
    const response = await axios.get(
      `${ARDUINO_BASE_URL}/api/dosificador`,
      { ...axiosConfig, timeout: 5000 }
    );
    const responseTime = Date.now() - startTime;
    
    res.json({
      success: true,
      message: 'Arduino conectado correctamente',
      response_time_ms: responseTime,
      arduino_ip: ARDUINO_IP,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Arduino no responde:', error.message);
    
    res.status(503).json({
      success: false,
      error: 'Arduino no disponible',
      details: error.message,
      arduino_ip: ARDUINO_IP,
      suggestions: [
        'Verificar que el Arduino esté encendido',
        'Verificar la conexión de red',
        'Verificar la IP del Arduino'
      ]
    });
  }
});

// Endpoint para obtener información del servidor
app.get('/api/info', (req, res) => {
  res.json({
    server: 'Arduino Dosificador API',
    version: '1.0.0',
    arduino_ip: ARDUINO_IP,
    arduino_port: ARDUINO_PORT,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    available_endpoints: [
      'GET / - Interfaz web',
      'GET /api/dosificador/estado - Estado del dosificador',
      'POST /api/dosificador/dispensar - Dispensar líquido',
      'GET /api/arduino/ping - Verificar conexión',
      'GET /api/info - Información del servidor'
    ]
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('💥 Error del servidor:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    details: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado correctamente');
  console.log(`📡 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`🤖 Arduino configurado en: ${ARDUINO_BASE_URL}`);
  console.log('📋 Endpoints disponibles:');
  console.log('   GET  / - Interfaz web');
  console.log('   GET  /api/dosificador/estado');
  console.log('   POST /api/dosificador/dispensar');
  console.log('   GET  /api/arduino/ping');
  console.log('   GET  /api/info');
  console.log('');
  console.log('Para probar la conexión:');
  console.log(`curl http://localhost:${PORT}/api/arduino/ping`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});