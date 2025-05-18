# ESP32 Testing Environment

This directory contains the testing setup for the ESP32 microcontroller integration with the Penguin Deterrence Software.

## Hardware Requirements
- ESP32 Wroom 32 WIFI Development Board
- DF Robot I2S microphone SEN0327 breakout board with MSM261S4030H0 microphone

## Connection Setup
- G → GND
- V → 3.3V
- WS → Pin 25
- CLK → Pin 26
- DA → Pin 33
- LR → GND

## Development Setup
1. Install Arduino IDE
2. Install ESP32 board support package in Arduino IDE
3. Install required libraries:
   - Arduino Audio Tools (https://github.com/pschatzmann/arduino-audio-tools)
   - ESP32 Audio Tools

## Testing
The `esp32_fft.ino` file contains the Arduino code for the ESP32. This code:
- Samples audio at 44.1kHz
- Performs FFT analysis
- Outputs frequency and magnitude data via Serial port at 115200 baud

## Integration Testing
The `websocket_test.ts` file provides a WebSocket client that connects to the main application and simulates the ESP32 data stream for testing purposes. 