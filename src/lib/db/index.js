const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { DB_PATH } = require('./config');

// Ensure the data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create/connect to SQLite database
console.log('Opening database at:', DB_PATH);
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Successfully connected to database');
  }
});

// Initialize the database schema
db.serialize(() => {
  console.log('Initializing database schema...');
  db.run(`CREATE TABLE IF NOT EXISTS detections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    microphoneId TEXT NOT NULL,
    frequency REAL,
    magnitude REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    type TEXT CHECK(type IN ('frequency', 'amplitude')) NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created successfully');
    }
  });
});

// Function to add a new detection
function addDetection(detection) {
  return new Promise((resolve, reject) => {
    const { microphoneId, frequency, magnitude, type } = detection;
    console.log('Adding detection:', detection);
    
    db.run(
      `INSERT INTO detections (microphoneId, frequency, magnitude, type) 
       VALUES (?, ?, ?, ?)`,
      [microphoneId, frequency, magnitude, type],
      function(err) {
        if (err) {
          console.error('Error adding detection:', err);
          reject(err);
        } else {
          console.log('Successfully added detection with ID:', this.lastID);
          resolve(this.lastID);
        }
      }
    );
  });
}

// Function to get recent detections with filtering
function getDetections({ 
  microphoneId = null, 
  startDate = null, 
  endDate = null,
  type = null,
  limit = 100,
  offset = 0,
  sortBy = 'timestamp',
  sortOrder = 'desc'
} = {}) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM detections WHERE 1=1';
    const params = [];

    if (microphoneId) {
      query += ' AND microphoneId = ?';
      params.push(microphoneId);
    }

    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    console.log('Executing query:', query, 'with params:', params);

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error getting detections:', err);
        reject(err);
      } else {
        console.log('Retrieved', rows.length, 'detections');
        resolve(rows);
      }
    });
  });
}

// Function to get detection statistics
function getStatistics(startDate = null, endDate = null) {
  return new Promise((resolve, reject) => {
    const params = [];
    let dateFilter = '';
    
    if (startDate) {
      dateFilter += ' AND timestamp >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND timestamp <= ?';
      params.push(endDate);
    }

    const query = `
      SELECT 
        microphoneId,
        COUNT(*) as total_detections,
        COUNT(CASE WHEN type = 'frequency' THEN 1 END) as penguin_detections,
        COUNT(CASE WHEN type = 'amplitude' THEN 1 END) as amplitude_alerts,
        AVG(CASE WHEN type = 'frequency' THEN frequency END) as avg_frequency,
        MAX(CASE WHEN type = 'frequency' THEN frequency END) as max_frequency,
        AVG(magnitude) as avg_magnitude,
        MAX(magnitude) as max_magnitude,
        MIN(timestamp) as first_detection,
        MAX(timestamp) as last_detection
      FROM detections
      WHERE 1=1 ${dateFilter}
      GROUP BY microphoneId
    `;

    console.log('Executing statistics query:', query, 'with params:', params);

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error getting statistics:', err);
        reject(err);
      } else {
        console.log('Retrieved statistics for', rows.length, 'microphones');
        resolve(rows);
      }
    });
  });
}

// Function to get total count of detections
function getTotalCount(filters = {}) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT COUNT(*) as count FROM detections WHERE 1=1';
    const params = [];

    if (filters.microphoneId) {
      query += ' AND microphoneId = ?';
      params.push(filters.microphoneId);
    }
    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    if (filters.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filters.endDate);
    }

    console.log('Executing count query:', query, 'with params:', params);

    db.get(query, params, (err, row) => {
      if (err) {
        console.error('Error getting total count:', err);
        reject(err);
      } else {
        console.log('Total count:', row.count);
        resolve(row.count);
      }
    });
  });
}

// Function to export detections to CSV format
function exportToCSV(filters = {}) {
  return new Promise((resolve, reject) => {
    getDetections({ ...filters, limit: 1000000 }) // Get all matching records
      .then(detections => {
        if (detections.length === 0) {
          resolve('No data to export');
          return;
        }

        // Create CSV header
        const headers = Object.keys(detections[0]).join(',');
        
        // Create CSV rows
        const rows = detections.map(detection => 
          Object.values(detection).map(value => 
            typeof value === 'string' ? `"${value}"` : value
          ).join(',')
        );

        // Combine header and rows
        const csv = [headers, ...rows].join('\n');
        resolve(csv);
      })
      .catch(reject);
  });
}

// Function to clear old detections (keep last 1000)
function clearOldDetections() {
  return new Promise((resolve, reject) => {
    console.log('Clearing old detections...');
    db.run(
      `DELETE FROM detections 
       WHERE id NOT IN (
         SELECT id FROM detections 
         ORDER BY timestamp DESC 
         LIMIT 1000
       )`,
      (err) => {
        if (err) {
          console.error('Error clearing old detections:', err);
          reject(err);
        } else {
          console.log('Successfully cleared old detections');
          resolve();
        }
      }
    );
  });
}

// Clear old detections periodically (every hour)
setInterval(clearOldDetections, 60 * 60 * 1000);

// Export functions
module.exports = {
  addDetection,
  getDetections,
  getStatistics,
  getTotalCount,
  exportToCSV
}; 