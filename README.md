# 🔧 Circuito Dosificador con Jeringa

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