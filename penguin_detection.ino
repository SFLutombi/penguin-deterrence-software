/****************************************************************
 * Penguin Detection System - Microphone Module
 * Author : Olive Schonfeldt (Modified for JSON output)
 * Date   : May, 2025
 * 
 * This code reads audio data from a DF Robot I2S microphone and performs
 * FFT analysis to detect penguin calls. It outputs formatted data that
 * can be parsed by the Node.js server.
 * 
 * Circuit:
 * ESP32 Wroom 32 WIFI connected to SEN0327:
 * - G → GND
 * - V → 3.3V 
 * - WS → pin 26
 * - CLK → pin 25
 * - DA → pin 33
 * - LR → GND
 ***************************************************************/

#if CONFIG_IDF_TARGET_ESP32
#include <Arduino.h>
#endif

#include <ArduinoBLE.h>

#include <AudioLogger.h>
#include <AudioTools.h>
#include <AudioToolsConfig.h>
#include <AudioTools/AudioLibs/AudioRealFFT.h>

#include <esp_system.h>
#include <driver/i2s.h>

// BLE service and characteristic UUIDs
BLEService penguinService("180F");
BLECharacteristic dataCharacteristic("2A19", 
                                   BLERead | BLENotify,
                                   64); // 64 bytes max

// Define I2S pins 
#define I2S_DA 33
#define I2S_CK 25
#define I2S_WS 26

// Global variables
uint16_t sample_rate = 44100;
uint8_t channels = 2; 

// Incoming audio data stream
I2SStream in;

// Variable that helps keep track when a sampling window has ended
bool newFFTResultAvailable = false;

// Variable that records the sum of the absolute values of the magnitude
float absVal = 0;

// Variable that records the FFT result
AudioRealFFT fft;
StreamCopy copier(fft, in);

// Penguin Detection Logic
#define NUM_TOP_FREQUENCIES_TO_CHECK 5
#define MIN_PENGUIN_FREQ 1000
#define MAX_PENGUIN_FREQ 2500
#define REQUIRED_MATCHES_FOR_PENGUIN 3
bool penguinDetected = false;

void sendData(const char* data) {
    if (BLE.connected()) {
        dataCharacteristic.writeValue(data);
    }
}

void fftResult(AudioFFTBase &fft_obj) 
{
    float diff;
    auto result = fft_obj.result();

    if (result.magnitude > 100) {
        AudioFFTResult topResults[NUM_TOP_FREQUENCIES_TO_CHECK];
        fft_obj.resultArray(topResults);

        int matches = 0;
        for (int i = 0; i < NUM_TOP_FREQUENCIES_TO_CHECK; i++) {
            if (topResults[i].frequency >= MIN_PENGUIN_FREQ && 
                topResults[i].frequency <= MAX_PENGUIN_FREQ) {
                matches++;
            }
        }
        
        penguinDetected = (matches >= REQUIRED_MATCHES_FOR_PENGUIN);
    } else {
        penguinDetected = false;
    }

    char data[64];  // Reduced buffer size
    snprintf(data, sizeof(data), "Amp Sum: %ld | Top Freq: %.1f Hz | %s",
             (long)absVal, result.frequency, penguinDetected ? "PENGUIN" : "NO");
    sendData(data);

    absVal = 0;
    newFFTResultAvailable = true;
}

void setup() 
{ 
    // Initialize BLE
    if (!BLE.begin()) {
        while (1);  // Don't proceed if BLE initialization fails
    }

    // Set advertised local name and service
    BLE.setLocalName("PenguinDetector");
    BLE.setAdvertisedService(penguinService);

    // Add characteristic to the service
    penguinService.addCharacteristic(dataCharacteristic);

    // Add service
    BLE.addService(penguinService);

    // Start advertising
    BLE.advertise();
    
    // Configure audio stream
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

    // Configure FFT with original settings
    auto tcfg = fft.defaultConfig();
    tcfg.length = 8192;
    tcfg.channels = channels;
    tcfg.sample_rate = sample_rate;
    tcfg.bits_per_sample = 16;
    tcfg.callback = &fftResult;
    fft.begin(tcfg);
}

void loop()
{
    // Listen for BLE connections
    BLE.poll();

    if (BLE.connected()) {
        copier.copy();
        
        size_t bytesAvailable = in.available();
        if (bytesAvailable >= 512 * sizeof(int16_t)) {
            int16_t i2sData[512];
            in.readBytes((uint8_t*)i2sData, sizeof(i2sData));
            for (int i = 0; i < (sizeof(i2sData) / sizeof(int16_t)); i++) {
                absVal += abs(i2sData[i]);
            }
        }
    }
    delay(1);
} 