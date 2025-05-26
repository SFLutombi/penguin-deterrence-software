const path = require('path');

// Define the database path relative to the project root
const DB_PATH = path.join(process.cwd(), 'data', 'detections.db');

module.exports = {
  DB_PATH
}; 