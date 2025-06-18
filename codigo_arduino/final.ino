#include <SPI.h>
#include <Ethernet.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Configuración de red
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 10, 31);  // IP estática
EthernetServer server(80);       // Puerto 80 para el servidor web

// Configuración de la pantalla LCD
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Dirección I2C 0x27, 16x2

// Pines
const int stepPin = 5;    // Pin para pulsos de paso
const int dirPin = 4;     // Pin para dirección
const int enablePin = 6;  // Pin para habilitar/deshabilitar el DRV8825
const int buttonPin = 10;  // Pin del pulsador KY-004
const int soundPin = A0;  // Pin para salida analógica del sensor KY-038

// Variables
float mlToDispense = 0.0;         // Cantidad de mL a dispensar
const float stepsPerMl = 20.0;  // Pasos por mL (ajusta según calibración)
bool dispensePending = false;     // Estado de dispensado pendiente
int lastButtonState = HIGH;       // Estado anterior del pulsador
const int soundThreshold = 50;    // Umbral para detectar chasquido (ajusta según pruebas)
bool soundTriggered = false;      // Estado para evitar múltiples activaciones
char requestBuffer[100];          // Búfer para solicitud HTTP
int bufferIndex = 0;              // Índice para el búfer

void setup() {
  // Configurar pines
  pinMode(stepPin, OUTPUT);
  pinMode(dirPin, OUTPUT);
  pinMode(enablePin, OUTPUT);        // Pin ENABLE para el DRV8825
  digitalWrite(enablePin, LOW);      // Habilitar el driver (LOW = encendido)
  pinMode(buttonPin, INPUT_PULLUP);  // Resistencia pull-up interna para pulsador
  pinMode(soundPin, INPUT);          // Entrada analógica para sensor de sonido

  // Iniciar comunicación serial para depuración
  Serial.begin(9600);

  // Iniciar Ethernet y servidor
  Ethernet.begin(mac, ip);
  server.begin();
  Serial.print(F("Servidor en: "));
  Serial.println(Ethernet.localIP());

  // Iniciar LCD
  lcd.begin(16, 2);  // Especificar 16 columnas y 2 filas
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print(F("Dispensador"));
  lcd.setCursor(0, 1);
  lcd.print(F("Listo"));
}

void loop() {
  // Manejar cliente web
  EthernetClient client = server.available();
  if (client) {
    bufferIndex = 0;
    bool currentLineIsBlank = true;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        if (bufferIndex < sizeof(requestBuffer) - 1) {
          requestBuffer[bufferIndex++] = c;
          requestBuffer[bufferIndex] = '\0';  // Terminar la cadena
        }

        // Fin de la solicitud HTTP
        if (c == '\n' && currentLineIsBlank) {
          // Procesar solicitud
          if (strstr(requestBuffer, "GET /?ml=") != NULL) {
            char *mlStart = strstr(requestBuffer, "ml=") + 3;
            char *mlEnd = strstr(mlStart, " HTTP");
            if (mlEnd) {
              *mlEnd = '\0';  // Terminar la subcadena
              mlToDispense = atof(mlStart);
              dispensePending = true;
              Serial.print(F("Solicitud de dispensar: "));
              Serial.print(mlToDispense);
              Serial.println(F(" mL"));

              // Actualizar LCD
              lcd.clear();
              lcd.setCursor(0, 0);
              lcd.print(F("mL: "));
              lcd.print(mlToDispense);
              lcd.setCursor(0, 1);
              lcd.print(F("Pulse o chasquido"));
            }
          }

          // Enviar respuesta HTTP (interfaz web con estilos simplificados)
          client.println(F("HTTP/1.1 200 OK"));
          client.println(F("Content-Type: text/html"));
          client.println(F("Connection: close"));
          client.println();
          client.println(F("<!DOCTYPE HTML>"));
          client.println(F("<html><head><title>Dispensador de Liquido</title>"));
          client.println(F("<style>"));
          client.println(F("body{font-family:Arial;background:#f4f4f9;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}"));
          client.println(F(".container{background:white;padding:15px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);text-align:center;max-width:300px;width:100%}"));
          client.println(F("h1{color:#333;font-size:20px;margin-bottom:15px}"));
          client.println(F("label{font-size:14px;color:#555;display:block;margin-bottom:5px}"));
          client.println(F("input[type=number]{padding:8px;font-size:14px;width:100%;margin-bottom:10px;border:1px solid #ccc;border-radius:4px}"));
          client.println(F("input[type=submit]{background:#28a745;color:white;padding:8px 15px;border:none;border-radius:4px;cursor:pointer;font-size:14px}"));
          client.println(F("input[type=submit]:hover{background:#218838}"));
          client.println(F("p{color:#333;font-size:12px;margin-top:10px}"));
          client.println(F("</style></head>"));
          client.println(F("<body><div class='container'>"));
          client.println(F("<h1>Dispensador de Liquido</h1>"));
          client.println(F("<form method='GET'>"));
          client.println(F("<label for='ml'>Cantidad (mL):</label>"));
          client.println(F("<input type='number' step='0.1' name='ml' id='ml' min='0' required>"));
          client.println(F("<input type='submit' value='Enviar'>"));
          client.println(F("</form>"));
          if (dispensePending) {
            client.println(F("<p>Esperando pulsador o chasquido para dispensar "));
            client.print(mlToDispense);
            client.println(F(" mL...</p>"));
          }
          client.println(F("</div></body></html>"));
          break;
        }
        if (c == '\n') {
          currentLineIsBlank = true;
        } else if (c != '\r') {
          currentLineIsBlank = false;
        }
      }
    }
    delay(1);
    client.stop();
  }

  // Leer pulsador y sensor de sonido
  int buttonState = digitalRead(buttonPin);
  int soundValue = analogRead(soundPin);

  // Depuración: Imprimir valor del sensor
  //Serial.print(F("Valor del sensor: "));
  //Serial.println(soundValue);

  // Detectar chasquido (valor analógico supera el umbral)
  if (soundValue > soundThreshold && !soundTriggered) {
    soundTriggered = true;  // Marcar como activado para evitar múltiples disparos
  } else if (soundValue < soundThreshold / 2) {
    soundTriggered = false;  // Resetear cuando el sonido cae por debajo de un umbral menor
  }

  // Activar dispensado si se presiona el pulsador o se detecta un chasquido
  if (dispensePending && ((lastButtonState == HIGH && buttonState == LOW) || (soundValue > soundThreshold && soundTriggered))) {
    // Iniciar dispensado
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(F("Dispensando..."));
    dispenseLiquid(mlToDispense);
    dispensePending = false;
    mlToDispense = 0.0;
    soundTriggered = false;  // Resetear el estado del sensor
    Serial.println(F("Dispensado completado"));

    // Actualizar LCD tras dispensar
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(F("Dispensado!"));
    delay(2000);  // Mostrar mensaje por 2 segundos
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(F("Dispensador"));
    lcd.setCursor(0, 1);
    lcd.print(F("Listo"));
  }

  // Actualizar estado anterior del pulsador
  lastButtonState = buttonState;
}

void dispenseLiquid(float ml) {
  // Habilitar el driver
  digitalWrite(enablePin, LOW);  // LOW = driver encendido

  // Calcular pasos necesarios
  long steps = (long)(ml * stepsPerMl);
  digitalWrite(dirPin, HIGH);  // Dirección (ajusta según el movimiento del émbolo)

  // Mover motor
  for (long i = 0; i < steps; i++) {
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(1000);  // Tiempo más lento para estabilidad
    digitalWrite(stepPin, LOW);
    delayMicroseconds(1000);
  }

  // Deshabilitar el driver para ahorrar energía
  digitalWrite(enablePin, HIGH);  // HIGH = driver apagado
}