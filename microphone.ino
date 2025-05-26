/****************************************************************

Author : Olive Schonfeldt (WebSocket modifications added)
Program: I2S Mic Code with WebSocket Support
Date   : May, 2025

This code reads audio data on a ESP32 Wroom 32 WIFI (! see below) at a sampling rate of 44.1kHz 
from the DF Robot I2S microphone SEN0327 breakout board with MSM261S4030H0 microphone.

It records a measure of the amplitude to the Serial console by taking the
sum of the absolute value of the audio data per sampling window. 

It also uses a FFT library (!! see below) to display the dominant frequency component of
the audio data.

It also uses the FFT library to display the top 5 dominant frequency components. If, by a system of
majority, these frequencies fall within the target frequency range for penguin calls, the code
concludes there is a penguin present. This helps identify penguin calls from white noise (ocean etc.).

The amplitude, dominant frequency, other 5 dominant frequencies and conclusion on penguin presence is
printed to the Serial console. The Serial Plotter built into the Arduino IDE can be used to plot the 
audio data (Tools -> Serial Plotter). Ensure your Baud rate is set to 115200 to be able to read legible data. 
 
Circuit:
* ESP32 Wroom 32 WIFI
* SEN0327:
  * G connected GND
  * V connected to 3.3V 
  * WS connected to pin 26
  * CLK connected to pin 25
  * DA connected to pin 33
  * LR connected to GND

(!) The 'esp32' programme by Espressif Systems can be downloaded by:
Arduino IDE -> Tools -> Manage Libraries... -> esp32 

(!!) The 'Arduino Audio Tools' programme can be downloaded here:
https://github.com/pschatzmann/arduino-audio-tools

FFT code has been adapted from here: 
https://www.elektor.com/products/practical-audio-dsp-projects-with-the-esp32#gallery 
Credit to namely,
* Author : Dogan Ibrahim
* Program: FFT
* Date   : May, 2023

Additional Circuit:
* No additional hardware needed - using ESP32's built-in WiFi

Additional Libraries:
* WiFi.h - Built into ESP32
* WebSocketsClient.h - Install "WebSockets" by Markus Sattler from Library Manager
**************************************************************/

// Force internal memory allocation instead of PSRAM
#define AUDIOTOOLS_DEFAULT_ALLOCATOR AudioTools::MEMORY_INTERNAL

//
// Relevant libraries 
// 
#include <AudioLogger.h>
#include <AudioTools.h>
#include <AudioToolsConfig.h>
#include <AudioTools/AudioLibs/AudioRealFFT.h>
#include <esp_system.h>
#include <driver/i2s.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <esp_heap_caps.h>

// WiFi Settings
const char* ssid = "ANJ Properties";     // Replace with your WiFi network name
const char* password = "";  // Replace with your WiFi password

// WebSocket Settings
const char* wsHost = "192.168.105.40";    // Your computer's IP address
const int wsPort = 3001;
const char* wsPath = "/";                  // Changed to root path for plain WebSocket

// Connection management
unsigned long lastReconnectAttempt = 0;
const unsigned long reconnectInterval = 2000; // Try to reconnect every 2 seconds
bool isConnecting = false;
int reconnectCount = 0;
const int maxReconnectAttempts = 5;

// Define I2S pins 
#define I2S_DA 33
#define I2S_CK 25
#define I2S_WS 26

// Audio Configuration
#define BUFFER_SIZE 512
#define FFT_SIZE 4096  // Reduced from 8192 but still large enough for accurate frequency detection
uint16_t sample_rate = 44100;
uint8_t channels = 1;  // Changed to mono to reduce memory usage
int16_t i2sData[BUFFER_SIZE];

// Incoming audio data stream
I2SStream in;

// Variable that helps keep track when a sampling window has ended, signalled by
// a new FFT result becoming available
bool newFFTResultAvailable = false;

// Vairable that records the sum of the absolute values of the magnitude of 
// incoming audio data as a measure of relative amplitude
float absVal = 0;

// Variable that records the FFT result
AudioRealFFT fft;
StreamCopy copier(fft, in);

// Penguin Detection Logic
#define NUM_TOP_FREQUENCIES_TO_CHECK 5 // How many of the biggest FFT results to examine
#define MIN_PENGUIN_FREQ 1000       // 1 kHz
#define MAX_PENGUIN_FREQ 2500       // 2.5 kHz
#define REQUIRED_MATCHES_FOR_PENGUIN 3 // How many of the top frequencies must be in range - majority vote
bool penguinDetected = false;

// WebSocket client instance
WebSocketsClient webSocket;

// Buffer for data sending
char msgBuffer[128];

//
// WebSocket event handler
//
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.println("WebSocket disconnected");
            if (!isConnecting) {
                reconnectCount = 0;
                attemptReconnect();
            }
            break;
            
        case WStype_CONNECTED:
            Serial.println("WebSocket connected successfully!");
            isConnecting = false;
            reconnectCount = 0;
            // Send initial handshake
            webSocket.sendTXT("{\"type\":\"hello\",\"device\":\"esp32\"}");
            break;
            
        case WStype_TEXT:
            Serial.printf("Received: %s\n", payload);
            break;
            
        case WStype_ERROR:
            Serial.println("WebSocket error occurred");
            if (!isConnecting) {
                attemptReconnect();
            }
            break;
            
        case WStype_PING:
            Serial.println("Received ping");
            break;
            
        case WStype_PONG:
            Serial.println("Received pong");
            break;
    }
}

void attemptReconnect() {
    if (isConnecting) return;  // Don't attempt if already trying
    
    unsigned long currentMillis = millis();
    if (currentMillis - lastReconnectAttempt >= reconnectInterval) {
        if (reconnectCount >= maxReconnectAttempts) {
            Serial.println("Max reconnection attempts reached. Restarting ESP32...");
            ESP.restart();  // Restart the ESP32
            return;
        }
        
        isConnecting = true;
        lastReconnectAttempt = currentMillis;
        reconnectCount++;
        
        Serial.printf("Attempting reconnection %d/%d...\n", reconnectCount, maxReconnectAttempts);
        
        // Check WiFi first
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("WiFi disconnected. Reconnecting to WiFi...");
            WiFi.begin(ssid, password);
            delay(1000);  // Give some time for WiFi to connect
        }
        
        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("WiFi connected, attempting WebSocket connection...");
            webSocket.begin(wsHost, wsPort, wsPath);
        }
        
        isConnecting = false;
    }
}

// Function to send data efficiently
void sendData(const char* type, float value1, float value2 = 0) {
    if (!webSocket.isConnected()) {
        attemptReconnect();
        return;
    }
    
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected, cannot send data");
        attemptReconnect();
        return;
    }
    
    if (value2 == 0) {
        snprintf(msgBuffer, sizeof(msgBuffer), 
                "{\"type\":\"amplitude\",\"value\":%.2f}", 
                value1);
    } else {
        snprintf(msgBuffer, sizeof(msgBuffer), 
                "{\"type\":\"fft\",\"frequency\":%.2f,\"magnitude\":%.2f}", 
                value1, value2);
    }
    
    webSocket.sendTXT(msgBuffer);
    Serial.printf("Sent: %s\n", msgBuffer);
}

//
// Displays the main frequency components and sends data via WebSocket
//
void fftResult(AudioFFTBase &fft_obj) 
{
    float diff;
    auto result = fft_obj.result();

    // Check if the overall magnitude is above a certain threshold
    if (result.magnitude > 100) {
        // Get the top 5 results
        AudioFFTResult topResults[NUM_TOP_FREQUENCIES_TO_CHECK];
        fft_obj.resultArray(topResults);

        // Calculate average frequency and magnitude
        float avgFrequency = 0;
        float avgMagnitude = 0;
        for (int i = 0; i < NUM_TOP_FREQUENCIES_TO_CHECK; i++) {
            avgFrequency += topResults[i].frequency;
            avgMagnitude += topResults[i].magnitude;
        }
        avgFrequency /= NUM_TOP_FREQUENCIES_TO_CHECK;
        avgMagnitude /= NUM_TOP_FREQUENCIES_TO_CHECK;

        // Count matches for penguin detection
        int matches = 0;
        for (int i = 0; i < NUM_TOP_FREQUENCIES_TO_CHECK; i++) {
            if (topResults[i].frequency >= MIN_PENGUIN_FREQ && 
                topResults[i].frequency <= MAX_PENGUIN_FREQ) {
                matches++;
            }
        }

        // Determine if it's a penguin
        penguinDetected = (matches >= REQUIRED_MATCHES_FOR_PENGUIN);

        // Send average data using optimized function
        sendData("fft", avgFrequency, avgMagnitude);
        if (absVal > 0) {
            sendData("amplitude", absVal);
            absVal = 0;  // Reset after sending
        }

        // Debug output
        Serial.print("Avg Freq: ");
        Serial.print(avgFrequency);
        Serial.print(" Hz | Avg Magnitude: ");
        Serial.print(avgMagnitude);
        Serial.print(" | Matches: ");
        Serial.print(matches);
        Serial.print(" -> ");
        
        if (penguinDetected) {
            Serial.print("PENGUIN");
        } else {
            Serial.print("NO");
        }
    } else {
        Serial.print("NO (Low Magnitude)");
    }
    Serial.println();
    newFFTResultAvailable = true;
}

void setup(void) 
{ 
  // Initialize PSRAM if available
  if(!psramInit()){
    Serial.println("PSRAM not available");
  } else {
    Serial.println("PSRAM initialized");
  }

  // Start Serial
  Serial.begin(115200);
  
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
  webSocket.setReconnectInterval(2000);  // Try to reconnect every 2 seconds
  webSocket.enableHeartbeat(15000, 3000, 2);
  
  Serial.println("WebSocket client started");
  
  // Configure I2S input stream with optimized settings
  auto configin = in.defaultConfig(RX_MODE);
  configin.sample_rate = sample_rate; 
  configin.channels = channels;         // Using mono
  configin.bits_per_sample = 16;
  configin.i2s_format = I2S_STD_FORMAT;
  configin.is_master = true;
  configin.port_no = 0;
  configin.pin_ws = I2S_WS;         
  configin.pin_bck = I2S_CK;      
  configin.pin_data = I2S_DA;     
  configin.pin_mck = 0;
  configin.buffer_size = BUFFER_SIZE;  // Set explicit buffer size
  configin.buffer_count = 4;           // Reduced buffer count
  in.begin(configin); 

  // Configure FFT with optimized settings
  auto tcfg = fft.defaultConfig();
  tcfg.length = FFT_SIZE;              // Using smaller FFT size
  tcfg.channels = channels;            // Mono
  tcfg.sample_rate = sample_rate;
  tcfg.bits_per_sample = 16;
  tcfg.callback = &fftResult;
  fft.begin(tcfg);
}

void loop()
{
  // Handle WebSocket connection
  webSocket.loop();

  // Check if we need to reconnect
  if (!webSocket.isConnected()) {
    attemptReconnect();
  }

  // Feed data to FFT
  copier.copy();

  // Accumulate amplitude while FFT result is being computed
  size_t bytesAvailable = in.available();
  if (bytesAvailable >= 512 * sizeof(int16_t)) { 
    in.readBytes((uint8_t*)i2sData, sizeof(i2sData));
    for (int i = 0; i < (sizeof(i2sData) / sizeof(int16_t)); i++) {
      absVal += abs(i2sData[i]);
    }
  }
}