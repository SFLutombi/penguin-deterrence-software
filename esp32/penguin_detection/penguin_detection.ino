#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// WebSocket server details
const char* websocket_server = "YOUR_COMPUTER_IP";  // Replace with your computer's IP address
const int websocket_port = 3000;
const char* websocket_path = "/api/esp32";

// Global variables
WebSocketsClient webSocket;

// Function to generate random float between min and max
float randomFloat(float min, float max) {
  return min + ((float)random(1000000) / 1000000.0) * (max - min);
}

void setup() {
  Serial.begin(115200);
  
  // Initialize random seed
  randomSeed(analogRead(0));
  
  // Initialize WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println("IP address: " + WiFi.localIP().toString());
  
  // Configure WebSocket client
  webSocket.begin(websocket_server, websocket_port, websocket_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  
  if (WiFi.status() == WL_CONNECTED) {
    // Generate simulated FFT data
    float frequency = randomFloat(100, 10000);  // Random frequency between 100Hz and 10kHz
    float magnitude = randomFloat(100, 1000);   // Random magnitude between 100 and 1000
    
    // Prepare and send FFT data
    StaticJsonDocument<200> fftDoc;
    fftDoc["frequency"] = frequency;
    fftDoc["magnitude"] = magnitude;
    
    String fftJson;
    serializeJson(fftDoc, fftJson);
    webSocket.sendTXT(fftJson);
    
    // Generate simulated amplitude data
    float amplitude = magnitude * 10;  // Amplify the magnitude for amplitude simulation
    
    // Prepare and send amplitude data
    StaticJsonDocument<200> ampDoc;
    ampDoc["type"] = "amplitude";
    ampDoc["value"] = amplitude;
    
    String ampJson;
    serializeJson(ampDoc, ampJson);
    webSocket.sendTXT(ampJson);
    
    // Print debug info
    Serial.println("Sent FFT - Freq: " + String(frequency) + "Hz, Mag: " + String(magnitude));
    Serial.println("Sent Amplitude: " + String(amplitude));
    
    delay(1000); // Wait 1 second between readings
  }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected!");
      break;
    case WStype_CONNECTED:
      Serial.println("WebSocket Connected!");
      break;
    case WStype_TEXT:
      // Handle incoming messages if needed
      break;
    case WStype_ERROR:
      Serial.println("WebSocket Error!");
      break;
  }
} 