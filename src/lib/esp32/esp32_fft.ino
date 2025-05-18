/****************************************************************
 * ESP32 FFT Code for Penguin Deterrence Software
 * Original Author: Olive Schonfeldt
 * Modified for WebSocket Integration
 ****************************************************************/

#include <AudioLogger.h>
#include <AudioTools.h>
#include <AudioToolsConfig.h>
#include <AudioTools/AudioLibs/AudioRealFFT.h>
#include <esp_system.h>
#include <driver/i2s.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// WebSocket configuration
const char* wsHost = "localhost";  // Change this to your server's IP when deploying
const int wsPort = 3000;
const char* wsPath = "/api/esp32";

WebSocketsClient webSocket;

// Define I2S pins 
#define I2S_DA 33
#define I2S_CK 26
#define I2S_WS 25

// Global variables
uint16_t sample_rate = 44100;
uint8_t channels = 2;
I2SStream in;
bool newFFTResultAvailable = false;
float absVal = 0;
AudioRealFFT fft;
StreamCopy copier(fft, in);

// JSON document for sending data
StaticJsonDocument<200> jsonDoc;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("Disconnected from WebSocket server");
      break;
    case WStype_CONNECTED:
      Serial.println("Connected to WebSocket server");
      break;
    case WStype_TEXT:
      // Handle incoming messages if needed
      break;
  }
}

void fftResult(AudioFFTBase &fft) {
  auto result = fft.result();
  if (result.magnitude > 100) {
    // Create JSON with frequency and magnitude
    jsonDoc.clear();
    jsonDoc["frequency"] = result.frequency;
    jsonDoc["magnitude"] = result.magnitude;
    
    // Serialize JSON to string
    String jsonString;
    serializeJson(jsonDoc, jsonString);
    
    // Send via WebSocket
    webSocket.sendTXT(jsonString);
    
    // Also print to Serial for debugging
    Serial.print(result.frequency);
    Serial.print(" Hz, ");
    Serial.print(result.magnitude);
    Serial.println(" magnitude");
  }
  newFFTResultAvailable = true;
}

void setupWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void setupWebSocket() {
  webSocket.begin(wsHost, wsPort, wsPath);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void setup() {
  Serial.begin(115200);
  
  // Setup WiFi and WebSocket
  setupWiFi();
  setupWebSocket();
  
  // Configure input stream
  auto configin = in.defaultConfig(RX_MODE);
  configin.sample_rate = sample_rate;
  configin.channels = channels;
  configin.bits_per_sample = 16;
  configin.i2s_format = I2S_STD_FORMAT;
  configin.is_master = true;
  configin.port_no = 0;
  configin.pin_ws = I2S_WS;
  configin.pin_bck = I2S_CK;
  configin.pin_data = I2S_DA;
  configin.pin_mck = 0;
  in.begin(configin);

  // Configure FFT
  auto tcfg = fft.defaultConfig();
  tcfg.length = 8192;
  tcfg.channels = channels;
  tcfg.sample_rate = sample_rate;
  tcfg.bits_per_sample = 16;
  tcfg.callback = &fftResult;
  fft.begin(tcfg);
}

void loop() {
  webSocket.loop();
  
  // Feed data to FFT
  copier.copy();
  
  // Accumulate amplitude
  size_t bytesAvailable = in.available();
  if (bytesAvailable >= 512 * sizeof(int16_t)) {
    int16_t i2sData[512];
    in.readBytes((uint8_t*)i2sData, sizeof(i2sData));
    for (int i = 0; i < 512 / 2; i++) {
      absVal += abs(i2sData[i]);
    }
  }

  if (newFFTResultAvailable) {
    // Send amplitude via WebSocket
    jsonDoc.clear();
    jsonDoc["type"] = "amplitude";
    jsonDoc["value"] = absVal;
    
    String jsonString;
    serializeJson(jsonDoc, jsonString);
    webSocket.sendTXT(jsonString);
    
    absVal = 0;
    newFFTResultAvailable = false;
  }
  
  delay(1);
} 