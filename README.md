# Penguin Deterrence Software

## Overview
This project is an advanced monitoring and control system designed to detect penguin activity using ESP32-based microphones and to activate deterrent mechanisms (lights, sound, or both) in response. It features a modern web dashboard for real-time monitoring, alerting, and control.

---

## Architecture
- **Frontend**: Next.js (React) app for the dashboard UI.
- **Backend**: Node.js/Express server for serial communication with ESP32 microphones and REST API for microphone data.
- **WebSocket Server**: Handles real-time data streaming from ESP32 devices.
- **ESP32 Firmware**: Arduino code for audio sampling, FFT analysis, and data transmission.

---

## Directory Structure
```
├── server.js                # Express server for serial communication
├── src/
│   ├── app/                 # Next.js app (UI, API routes)
│   ├── components/          # React UI components
│   ├── lib/
│   │   ├── esp32/           # ESP32 integration, test scripts, firmware
│   │   └── websocket/       # WebSocket server code
├── esp32/
│   └── penguin_detection/   # Additional ESP32 firmware
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
```

---

## Environment Setup
### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- Arduino IDE (for ESP32 firmware)
- ESP32 Wroom 32 board and DF Robot I2S microphone (for hardware integration)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
- No .env file is required for basic local development.
- For ESP32 WiFi, update `ssid` and `password` in `src/lib/esp32/esp32_fft.ino`.

### 3. Start the Servers
- **Frontend (Next.js):**
  ```bash
  npm run dev
  ```
  Runs the dashboard at [http://localhost:3000](http://localhost:3000)

- **Backend (Serial/REST API):**
  ```bash
  node server.js
  ```
  Runs the serial API at [http://localhost:3001](http://localhost:3001)

- **WebSocket Server:**
  (Usually started by Next.js or can be run via scripts in `src/lib/websocket`)

### 4. ESP32 Firmware
- Open `src/lib/esp32/esp32_fft.ino` in Arduino IDE.
- Update WiFi credentials.
- Flash to ESP32 board.

---

## Key Components
### Frontend (Next.js)
- `src/app/page.tsx`: Main dashboard page.
- `src/components/AlertDisplay.tsx`: Shows detection alerts and history.
- `src/components/DeterrentControls.tsx`: UI to activate deterrents.
- `src/components/MicrophoneData.tsx`: Displays real-time microphone data.

### Backend
- `server.js`: Express server for serial communication with ESP32 microphones. Provides `/api/microphones` endpoints.
- `src/lib/esp32/serialHandler.ts`: Handles serial port connection and data parsing.
- `src/lib/websocket/server.ts`: WebSocket server for real-time data.

### API Routes (Next.js)
- `src/app/api/log/route.ts`: Stores and retrieves detection logs.
- `src/app/api/deter/route.ts`: Handles deterrent activation commands.
- `src/app/api/serial/route.ts`: Manages serial connection and commands.

### ESP32 Integration
- `src/lib/esp32/esp32_fft.ino`: Firmware for audio sampling, FFT, and data transmission via WebSocket.
- `src/lib/esp32/websocket_test.js`: Simulates ESP32 data for testing.
- `esp32/penguin_detection/penguin_detection.ino`: Additional firmware example.

---

## How to Run (Summary)
1. Install dependencies: `npm install`
2. Start Next.js frontend: `npm run dev`
3. Start backend serial server: `node server.js`
4. (Optional) Simulate ESP32: `npm run test:esp32`
5. Flash ESP32 with firmware and connect hardware.
6. Access dashboard at [http://localhost:3000](http://localhost:3000)

---

## Development & Testing
- Use `npm run lint` to check code style.
- Use `npm run build` to build the Next.js app for production.
- Use `npm run test:esp32` to simulate ESP32 data stream.

---

## Notes
- Serial port names (e.g., `COM1`, `COM2`) may need to be changed to match your OS (e.g., `/dev/ttyUSB0` on Linux).
- The backend uses in-memory storage for logs and commands; for production, replace with a database.
- For hardware setup, see `src/lib/esp32/README.md` for wiring and requirements.

---

## Contact
For questions or contributions, please open an issue or pull request. 