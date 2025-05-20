/****************************************************************

Author : Olive Schonfeldt
Program: I2S Mic Code
Date   : May, 2025

This code reads audio data on a ESP32 Wroom 32 WIFI (! see below) at a sampling rate of 44.1kHz 
from the DF Robot I2S microphone SEN0327 breakout board with MSM261S4030H0 microphone.

It records a measure of the amplitude to the Serial console by taking the
sum of the absolute value of the audio data per sampling window. 

It also uses a FFT library (!! see below) to display the dominant frequency component of
the audio data.

The amplitude and frequency is printed to the Serial console. The Serial Plotter 
built into the Arduino IDE can be used to plot the audio data (Tools -> Serial Plotter). 
Ensure your Baud rate is set to 115200 to be able to read legible data. 
 
Circuit:
* ESP32 Wroom 32 WIFI
* SEN0327:
  * G connected GND
  * V connected to 3.3V 
  * WS (LR) connected to pin 26
  * CLK connected to pin 25
  * DA connected to pin 33

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

**************************************************************/

//
// Relevant libraries 
// 
#include <AudioLogger.h>
#include <AudioTools.h>
#include <AudioToolsConfig.h>
#include <AudioTools/AudioLibs/AudioRealFFT.h>

#include <esp_system.h>
#include <driver/i2s.h>

// Define I2S pins 
#define I2S_DA 33 // SEN0327 DA (Data Out) connected to ESP32 GPIO 33 
#define I2S_CK 25 // SEN0327 CK (Clock) connected to ESP32 GPIO 25 
#define I2S_WS 26 // SEN0327 WS (Word Select/Left-Right, LR) connected to ESP32 GPIO 26

//
// Global variables
//

// Define sampling rate and channels
uint16_t sample_rate = 44100;
uint8_t channels = 2; 

// Incoming audio data stream
I2SStream in;

// Variable that helps keep track when a sampling window has ended, signalled by
// a new FFT result becoming available
bool newFFTResultAvailable = false;

// Variable that records the sum of the absolute values of the magnitude of 
// incoming audio data as a measure of relative amplitude
float absVal = 0;

// Variable that records the FFT result
AudioRealFFT fft;
StreamCopy copier(fft, in);

// Store the last frequency result
float lastFrequency = 0;

//
// Displays FFT result (the main frequency component) on Serial Monitor
//

void fftResult(AudioFFTBase &fft)
{
  auto result = fft.result();
  if (result.magnitude > 100)
  {
    lastFrequency = result.frequency;
  }

  newFFTResultAvailable = true; // Set the flag when a new result is available
}

void setup(void) 
{ 
// Baud rate
  Serial.begin(115200);
  
//
// Configure in stream
//
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

//
// Configure FFT
//
  auto tcfg = fft.defaultConfig();
  tcfg.length = 8192;
  tcfg.channels = channels;
  tcfg.sample_rate = sample_rate;
  tcfg.bits_per_sample = 16;
  tcfg.callback = &fftResult;
  fft.begin(tcfg);
}

//
// Copy input signal to FFT and record amplitude
// 
void loop() 
{
  // Feed data to FFT
  copier.copy(); 
  
  // Accumulate amplitude while FFT result is being computed
  size_t bytesAvailable = in.available();
  if (bytesAvailable >= 512 * sizeof(int16_t)) {
    int16_t i2sData[512];
    in.readBytes((uint8_t*)i2sData, sizeof(i2sData));
    for (int i = 0; i < 512 / 2; i++) {
      absVal += abs(i2sData[i]);
    }
  }

  // Send data as JSON when new FFT result is available
  if (newFFTResultAvailable) {
    // Create JSON string
    Serial.print("{\"amplitude\":");
    Serial.print(absVal);
    Serial.print(",\"frequency\":");
    Serial.print(lastFrequency);
    Serial.print(",\"timestamp\":");
    Serial.print(millis());
    Serial.println("}");

    absVal = 0; // Reset the accumulator
    newFFTResultAvailable = false; // Reset the flag
  }
  
  // Small delay
  delay(1);
} 