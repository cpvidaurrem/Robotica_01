# 💧 Dispensador de Líquido Automático

Un sistema completo de dispensado de líquido controlado por Arduino con interfaz web moderna, que permite dispensar cantidades precisas de líquido mediante activación por pulsador o detección de sonido (chasquido).

## 🌟 Características

- **Control preciso**: Dispensado exacto en mililitros usando motor paso a paso
- **Doble activación**: Pulsador físico o detección de chasquido para dispensar
- **Interfaz web moderna**: Frontend responsive con Node.js y diseño contemporáneo
- **Display LCD**: Información en tiempo real del estado del sistema
- **Conectividad Ethernet**: Control remoto a través de la red local
- **Indicadores de estado**: Monitoreo de conexión en tiempo real

## 🛠️ Componentes de Hardware

### Arduino y Electrónica
- **Arduino Uno/Nano** (compatible)
- **Shield Ethernet W5100** para conectividad de red
- **Motor paso a paso NEMA 17** con driver DRV8825
- **Display LCD 16x2 I2C** (dirección 0x27)
- **Pulsador KY-004** con resistencia pull-up
- **Sensor de sonido KY-038** para detección de chasquidos
- **Jeringa y sistema mecánico** para dispensado

### Conexiones
```
Arduino Pin → Componente
D4          → DIR (DRV8825)
D5          → STEP (DRV8825)
D6          → ENABLE (DRV8825)
D10         → Pulsador KY-004
A0          → Sensor sonido KY-038
A4          → SDA (LCD I2C)
A5          → SCL (LCD I2C)
```

## 📁 Estructura del Proyecto

```
dispensador-liquido/
├── arduino/
│   └── dispensador.ino          # Código del Arduino
├── frontend/
│   ├── server.js                # Servidor Node.js
│   ├── package.json             # Dependencias del proyecto
│   └── public/
│       └── index.html           # Interfaz web
├── docs/
│   ├── wiring-diagram.png       # Diagrama de conexiones
│   └── hardware-setup.md        # Guía de montaje
└── README.md
```

## 🚀 Instalación y Configuración

### 1. Configuración del Arduino

#### Librerías Requeridas
```cpp
#include <SPI.h>           // Para comunicación Ethernet
#include <Ethernet.h>      // Para conectividad de red
#include <Wire.h>          // Para comunicación I2C
#include <LiquidCrystal_I2C.h>  // Para el display LCD
```

Instalar a través del Library Manager de Arduino IDE:
- `Ethernet` (incluida)
- `LiquidCrystal I2C` por Frank de Brabander

#### Configuración de Red
```cpp
// Configurar en el código Arduino
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 10, 31);  // Ajustar según tu red
```

#### Calibración del Motor
```cpp
const float stepsPerMl = 20.0;  // Ajustar según calibración
```

### 2. Configuración del Frontend

#### Requisitos
- Node.js 16+ 
- npm o yarn

#### Instalación
```bash
cd frontend/
npm install
```

#### Configuración
Editar `server.js` con la IP de tu Arduino:
```javascript
const ARDUINO_IP = '192.168.10.31';  // IP de tu Arduino
const ARDUINO_PORT = 80;
```

#### Ejecución
```bash
npm start
# Servidor disponible en http://localhost:3000
```

## 🎯 Uso del Sistema

### Desde la Interfaz Web

1. **Acceder** a `http://localhost:3000`
2. **Verificar conexión** con el Arduino (indicador de estado)
3. **Introducir cantidad** en mL o usar botones rápidos
4. **Presionar "Dispensar"** 
5. **Activar** físicamente:
   - Presionar el pulsador, O
   - Hacer un chasquido cerca del sensor

### Desde el Arduino Directo

También puedes acceder directamente al Arduino visitando su IP:
`http://192.168.10.31` (según tu configuración)

## 🔧 Calibración

### Motor Paso a Paso
1. **Medir** volumen real dispensado para una cantidad conocida
2. **Calcular** nueva relación: `pasos_reales / ml_reales = stepsPerMl`
3. **Actualizar** constante en el código Arduino

### Sensor de Sonido
1. **Monitorear** valores en Serial Monitor
2. **Ajustar** `soundThreshold` según ambiente:
   ```cpp
   const int soundThreshold = 50;  // Aumentar si es muy sensible
   ```

## 📡 API del Sistema

### Endpoints del Frontend

#### `POST /dispense`
Envía solicitud de dispensado al Arduino
```json
{
  "ml": 25.5
}
```

#### `GET /status`
Verifica estado de conexión con Arduino
```json
{
  "success": true,
  "online": true,
  "message": "Arduino conectado"
}
```

### Endpoints del Arduino

#### `GET /?ml={cantidad}`
Programa cantidad a dispensar
- **Ejemplo**: `http://192.168.10.31/?ml=15.5`
- **Respuesta**: Página HTML con estado

## 🔍 Solución de Problemas

### Problemas Comunes

#### Arduino no responde
- ✅ Verificar conexiones Ethernet
- ✅ Comprobar configuración de red
- ✅ Revisar alimentación del shield Ethernet

#### Motor no se mueve
- ✅ Verificar conexiones del DRV8825
- ✅ Comprobar alimentación del motor (12V)
- ✅ Revisar pin ENABLE (debe estar en LOW)

#### Sensor de sonido muy sensible
- ✅ Ajustar `soundThreshold` a valor mayor
- ✅ Verificar posicionamiento del sensor
- ✅ Revisar ruido ambiental

#### Frontend no conecta
- ✅ Verificar IP del Arduino en `server.js`
- ✅ Comprobar que ambos dispositivos estén en la misma red
- ✅ Revisar firewall/antivirus

### Debug Mode

Activar salida serial en Arduino para debugging:
```cpp
// Descomentar línea en loop()
Serial.print(F("Valor del sensor: "));
Serial.println(soundValue);
```

## 🛡️ Consideraciones de Seguridad

- **Validación de entrada**: Límites de cantidad (0-1000 mL)
- **Timeout de red**: 5 segundos para evitar bloqueos
- **Protección del motor**: Auto-deshabilitación después del uso
- **Límites físicos**: Implementar switches de límite si es necesario

## 📈 Mejoras Futuras

- [ ] **Historial de dispensado** con base de datos
- [ ] **Múltiples líquidos** con selección
- [ ] **Control por voz** con reconocimiento de speech
- [ ] **App móvil** nativa
- [ ] **Notificaciones push** de estado
- [ ] **Sistema de usuarios** con autenticación
- [ ] **Integración IoT** con MQTT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. **Fork** el repositorio
2. **Crear** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir** un Pull Request


# 🔧 Guía para los componentes básicos del Circuito Dosificador con Jeringa

Sistema de dosificación automática basado en Arduino Uno con motor paso a paso, pulsador y conectividad Ethernet.

## 📋 Descripción

Este proyecto implementa un sistema de dosificación precisa utilizando una jeringa controlada por un motor paso a paso NEMA 17. El sistema puede ser controlado localmente mediante un pulsador o remotamente a través de una interfaz web usando conectividad Ethernet.

## 📦 Componentes Requeridos

### Hardware Principal
- **Arduino Uno R3** - Microcontrolador principal con 14 pines digitales y 6 analógicos
- **Motor Paso a Paso NEMA 17** - 200 pasos por revolución, 12V, ~1.5A por bobina
- **Driver A4988** - Control de motor paso a paso con microstepping hasta 1/16 y protección térmica
- **Pulsador KY-004** - Botón momentáneo de 3 pines con pull-up interno
- **Jeringa + Mecanismo** - Jeringa de 10ml o 20ml con acoplamiento motor-émbolo
- **Fuente de Poder** - 12V, mínimo 2A para motor y Arduino
- **Módulo Ethernet ENC28J60** - Conectividad de red con interfaz SPI, IP fija: 192.168.10.31

### Accesorios
- Cables jumper M-M, M-F
- Protoboard
- Capacitor 100μF (para driver)
- Resistencias pull-up (10kΩ)

## 🔗 Conexiones

### Driver A4988
| Pin Driver | Pin Arduino | Cable | Función |
|------------|-------------|-------|---------|
| STEP | D2 | Azul | Pulsos para pasos |
| DIR | D3 | Verde | Dirección del motor |
| ENABLE | D4 | Amarillo | Habilitar/deshabilitar |
| VDD | 5V | Rojo | Alimentación lógica |
| GND | GND | Negro | Tierra común |
| VMOT | Fuente 12V+ | Rojo grueso | Alimentación motor |

### Pulsador KY-004
| Pin Pulsador | Pin Arduino | Cable | Función |
|-------------|-------------|-------|---------|
| S | D9 | Naranja | Señal del botón |
| VCC | 5V | Rojo | Alimentación |
| GND | GND | Negro | Tierra |

### Ethernet ENC28J60
| Pin Ethernet | Pin Arduino | Cable | Función |
|-------------|-------------|-------|---------|
| VCC | 3.3V | Rojo | ⚠️ Importante: 3.3V |
| GND | GND | Negro | Tierra |
| SCK | D13 | Morado | SPI Clock |
| MISO | D12 | Café | SPI MISO |
| MOSI | D11 | Rosa | SPI MOSI |
| CS | D10 | Gris | Chip Select |

## 📋 Esquema del Circuito

```
┌─────────────────┐        ┌──────────────┐
│   ARDUINO UNO   │        │   A4988      │
│                 │        │   DRIVER     │
│            D2 ──┼────────┼─ STEP        │
│            D3 ──┼────────┼─ DIR         │
│            D4 ──┼────────┼─ ENABLE      │
│           5V ───┼────────┼─ VDD         │
│          GND ───┼────────┼─ GND         │
│                 │        │              │
│          D9 ────┼──┐     │ 1A ┌─────────┼─ MOTOR
│         5V ─────┼──│──┐  │ 1B │         │  PASO A
│        GND ─────┼──│──│──┼─2A │ NEMA 17 │  PASO
│                 │  │  │  │ 2B └─────────┼─ (4 hilos)
│        3.3V ────┼──│──│──┼─ VMOT        │
│        D10 ─────┼──│──│  │ (12V Fuente) │
│        D11 ─────┼──│──│  └──────────────┘
│        D12 ─────┼──│──│
│        D13 ─────┼──│──│  ┌──────────────┐
└─────────────────┘  │  │  │ PULSADOR     │
                     │  │  │ KY-004       │
                     │  └──┼─ VCC         │
                     │     │ S ───────────┘
                     │     │ GND
                     │     └──┐
                     │        │
                     │ ┌──────┴──────────┐
                     │ │  ETHERNET       │
                     │ │  ENC28J60       │
                     └─┼─ VCC            │
                       │ GND, SCK, MISO, │
                       │ MOSI, CS        │
                       └─────────────────┘

FUENTE DE PODER 12V/2A
┌─────────────┐
│    12V DC   │───┬─── VMOT (Driver A4988)
│    POWER    │   │
│   SUPPLY    │   └─── VIN (Arduino - Opcional)
│             │
│        GND  │───── GND común
└─────────────┘
```

## 🔨 Instrucciones de Armado

### Paso 1: Preparar la base y estructura
Monta la jeringa en una estructura fija (madera, acrílico o metal). El émbolo debe estar alineado con el eje del motor paso a paso. Puedes usar un acoplamiento flexible o imprimir en 3D una pieza de conexión.

### Paso 2: Conectar el driver A4988
Coloca el driver en la protoboard. Conecta VDD y GND del driver a 5V y GND del Arduino. Conecta VMOT a la fuente de 12V. **IMPORTANTE**: Coloca un capacitor de 100μF entre VMOT y GND del driver.

### Paso 3: Conectar motor paso a paso
Identifica los pares de bobinas del motor (usa multímetro para medir continuidad). Conecta un par a 1A/1B y el otro par a 2A/2B del driver. Si el motor gira al revés, intercambia un par completo.

### Paso 4: Conectar pines de control
Conecta STEP (D2), DIR (D3) y ENABLE (D4) del Arduino al driver. Estos controlan el movimiento del motor desde el código.

### Paso 5: Instalar pulsador
Conecta el módulo KY-004: VCC a 5V, GND a GND, y la señal S al pin D9 del Arduino. El código ya tiene configurado el pull-up interno.

### Paso 6: Conectar módulo Ethernet
Conecta el ENC28J60 usando los pines SPI del Arduino. **IMPORTANTE**: Alimenta con 3.3V, no con 5V. Conecta un cable Ethernet al módulo.

### Paso 7: Configurar fuente de poder
Usa una fuente de 12V/2A mínimo. Conecta positivo a VMOT del driver y opcionalmente al VIN del Arduino. Conecta negativo al GND común de todo el circuito.

### Paso 8: Programar y probar
Carga el código optimizado al Arduino. Verifica que responda en la IP 192.168.10.31. Prueba primero sin la jeringa conectada para verificar el movimiento del motor.

## ⚠️ Advertencias Importantes

### Polaridad y Voltajes
- El módulo Ethernet debe alimentarse con **3.3V únicamente**
- El driver A4988 necesita **12V en VMOT** pero **5V en VDD**
- Verifica polaridades antes de energizar

### Corriente del Motor
- El motor NEMA 17 puede consumir hasta 1.5A por bobina
- Asegúrate de que tu fuente pueda suministrar al menos **3A en total**

### Seguridad
- Si vas a dispensar líquidos, asegúrate de que sean compatibles con los materiales de la jeringa
- Para aplicaciones médicas o alimentarias, usa componentes grado médico

## 💡 Consejos y Optimizaciones

### Calibración
- El valor `STEPS_PER_ML = 20` en el código es aproximado
- Calibra midiendo cuántos pasos necesita el motor para dispensar exactamente 1ml de agua

### Acoplamiento Motor-Jeringa
- Usa un acoplamiento flexible entre el motor y el émbolo de la jeringa
- Esto compensa pequeños desalineamientos y reduce la carga mecánica

### Microstepping
- Puedes configurar microstepping en el A4988 conectando MS1, MS2, MS3 a 5V o GND
- Consulta la tabla del datasheet para mayor suavidad

## 🔧 Solución de Problemas

### Motor no se mueve
- Verifica conexiones STEP, DIR, ENABLE
- Verifica alimentación 12V en VMOT
- Verifica que ENABLE esté en LOW para activar

### Motor se mueve irregular
- Ajusta el potenciómetro del driver A4988
- Verifica que la fuente tenga suficiente corriente
- Reduce la velocidad (aumenta delayMicroseconds)

### Ethernet no conecta
- Verifica que esté alimentado con 3.3V
- Verifica conexiones SPI (pins 10,11,12,13)
- Verifica configuración de red

### Dosificación imprecisa
- Calibra STEPS_PER_ML con mediciones reales
- Verifica que no haya burbujas de aire
- Asegúrate de que el émbolo se mueva suavemente

## 📚 Configuración de Red

- **IP fija**: 192.168.10.31
- **Protocolo**: HTTP
- **Puerto**: 80 (estándar)
- **Interfaz**: SPI (ENC28J60)

## 🛠️ Mantenimiento

1. **Limpieza regular** de la jeringa y tubería
2. **Verificación periódica** de las conexiones eléctricas
3. **Calibración** cuando sea necesario
4. **Lubricación** del mecanismo motor-émbolo según uso

## 📄 Licencia

Este proyecto es de código abierto. Úsalo bajo tu propia responsabilidad y asegúrate de cumplir con las regulaciones locales si es para uso médico o industrial.

---

**Nota**: Este es un proyecto educativo/experimental. Para aplicaciones críticas, consulta con profesionales especializados.