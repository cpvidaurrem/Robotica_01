# Robotica_01

# 🌐 Control Web con Arduino (Ethernet + DHT11 + Motor + Relé)

Este proyecto permite controlar un foco, un LED, y un motor paso a paso a través de una página web, además de monitorear en tiempo real la temperatura y la humedad usando un sensor DHT11.

---

## 🧰 Tecnologías y Componentes

### 🔌 Electrónica
- Arduino UNO
- Módulo Ethernet W5100
- Sensor DHT11
- Módulo Relé 5V
- LED Azul
- Resistencia 220Ω
- Motor paso a paso (28BYJ-48 o NEMA 17)
- Driver DRV8825
- Fuente de alimentación externa (para el motor)

### 💻 Software
- IDE de Arduino
- Librerías:
  - `Ethernet.h`
  - `SPI.h`
  - `DHT.h`

---

## ⚡ Esquema Electrónico

> Puedes insertar una imagen aquí si tienes el diagrama en Fritzing.

```text
[DHT11]          → Pin 2  
[LED Azul]       → Pin 6  
[Relé 220V]      → Pin 7  
[Motor DRV8825]  → Step=8, Dir=9, Enable=10  
[Ethernet W5100] → Conectado por SPI
