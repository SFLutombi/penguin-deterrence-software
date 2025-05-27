#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// Pin definitions
#define LED_PIN 2         // Onboard LED
const int pinStrobe = 15; // Strobe light pin
const int pinSiren = 2;   // Siren pin

// Control variables
int strobe = 0;
int siren = 0;
int strobeOff = 0;
int sirenOff = 0;
int reset = 0;

// WebSocket client
WebSocketsClient webSocket;

// WiFi credentials
const char* ssid = "Cal";     // Replace with your WiFi network name
const char* password = "qwertyui";               // Replace with your WiFi password

// WebSocket server details
const char* wsHost = "192.168.105.40";    // Your server IP
const int wsPort = 8080;                 // Port for deterrent control
const char* wsPath = "/";                // Root path

// Function declarations
void turnOnStrobe();
void turnOffStrobe();
void turnOnSiren();
void turnOffSiren();
void turnOnAll();
void turnOffAll();
void flashLED(int duration);

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("WebSocket disconnected");
            break;
            
        case WStype_CONNECTED:
            Serial.println("WebSocket connected successfully!");
            // Send initial handshake identifying as a deterrent device
            webSocket.sendTXT("{\"type\":\"hello\",\"device\":\"deterrent\"}");
            break;
            
        case WStype_TEXT:
            Serial.printf("Received: %s\n", payload);
            // Parse the command
            StaticJsonDocument<200> doc;
            DeserializationError error = deserializeJson(doc, payload);
            
            if (error) {
                Serial.println("Failed to parse command");
                return;
            }

            // Handle the command
            const char* command = doc["command"];
            if (command) {
                if (strcmp(command, "lights_on") == 0) {
                    strobe = 1;
                    strobeOff = 0;
                }
                else if (strcmp(command, "sound_on") == 0) {
                    siren = 1;
                    sirenOff = 0;
                }
                else if (strcmp(command, "both_on") == 0) {
                    strobe = 1;
                    siren = 1;
                    strobeOff = 0;
                    sirenOff = 0;
                }
                else if (strcmp(command, "lights_off") == 0) {
                    strobeOff = 1;
                    strobe = 0;
                }
                else if (strcmp(command, "sound_off") == 0) {
                    sirenOff = 1;
                    siren = 0;
                }
                else if (strcmp(command, "both_off") == 0) {
                    strobeOff = 1;
                    sirenOff = 1;
                    strobe = 0;
                    siren = 0;
                }
                else if (strcmp(command, "reset") == 0) {
                    reset = 1;
                }
            }
            break;
    }
}

void setup() {
    Serial.begin(115200);
    
    // Initialize pins
    pinMode(LED_PIN, OUTPUT);
    pinMode(pinStrobe, OUTPUT);
    pinMode(pinSiren, OUTPUT);
    turnOffAll();
    
    // Connect to WiFi
    Serial.print("Connecting to WiFi");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    // Configure WebSocket
    webSocket.begin(wsHost, wsPort, wsPath);
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(2000);
    
    Serial.println("WebSocket client started");
}

void loop() {
    webSocket.loop();

    if (reset == 1) {
        turnOffAll();
        reset = 0;
    } else {
        // Handle individual controls
        if (strobe == 1) {
            digitalWrite(pinStrobe, HIGH);
        }
        if (strobeOff == 1) {
            digitalWrite(pinStrobe, LOW);
            strobeOff = 0;
        }
        
        if (siren == 1) {
            digitalWrite(pinSiren, HIGH);
        }
        if (sirenOff == 1) {
            digitalWrite(pinSiren, LOW);
            sirenOff = 0;
        }
        
        // Update LED status
        if (strobe == 1 || siren == 1) {
            digitalWrite(LED_PIN, HIGH);
        } else {
            digitalWrite(LED_PIN, LOW);
        }
    }

    delay(100); // Small delay to prevent bouncing or flooding
}

// Control Functions
void turnOnStrobe() {
    digitalWrite(pinStrobe, HIGH);
    digitalWrite(LED_PIN, HIGH);
}

void turnOffStrobe() {
    digitalWrite(pinStrobe, LOW);
    if (siren == 0) {
        digitalWrite(LED_PIN, LOW);
    }
}

void turnOnSiren() {
    digitalWrite(pinSiren, HIGH);
    digitalWrite(LED_PIN, HIGH);
}

void turnOffSiren() {
    digitalWrite(pinSiren, LOW);
    if (strobe == 0) {
        digitalWrite(LED_PIN, LOW);
    }
}

void turnOnAll() {
    digitalWrite(pinStrobe, HIGH);
    digitalWrite(pinSiren, HIGH);
    digitalWrite(LED_PIN, HIGH);
}

void turnOffAll() {
    digitalWrite(pinStrobe, LOW);
    digitalWrite(pinSiren, LOW);
    digitalWrite(LED_PIN, LOW);
    strobe = 0;
    siren = 0;
    strobeOff = 0;
    sirenOff = 0;
    reset = 0;
}

void flashLED(int duration) {
    digitalWrite(LED_PIN, HIGH);
    delay(duration);
    digitalWrite(LED_PIN, LOW);
    delay(duration);
} 