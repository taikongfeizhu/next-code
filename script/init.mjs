import sqlite3 from 'sqlite3';

// Create a new database connection
const db = new sqlite3.Database('./moon-cake.sqlite3', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the database.');

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(5) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(10) NOT NULL CHECK (role IN ('employee', 'admin'))
    );
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
      return;
    }
    console.log('Users table created successfully');

    // Create applications table
    db.run(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id VARCHAR(5) NOT NULL,
        box_type VARCHAR(10) NOT NULL CHECK (box_type IN ('regular', 'halal')),
        delivery_type VARCHAR(10) NOT NULL CHECK (delivery_type IN ('offline', 'online')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
        address VARCHAR(100),
        tracking_number VARCHAR(50),
        courier_company VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES users(employee_id)
      );
    `, (err) => {
      if (err) {
        console.error('Error creating applications table:', err.message);
        return;
      }
      console.log('Applications table created successfully');
    });

    // Insert admin user
    db.run(`
      INSERT OR IGNORE INTO users (employee_id, password, role)
      VALUES ('admin', 'admin123', 'admin');
    `);

    // Insert test employee users (e0001-e0010)
    for (let i = 1; i <= 10; i++) {
      const employeeId = `e${i.toString().padStart(4, '0')}`;
      const password = `password${i}`;
      db.run(`
        INSERT OR IGNORE INTO users (employee_id, password, role)
        VALUES (?, ?, 'employee');
      `, [employeeId, password]);
    }
  });
});

// Close the database connection
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
      return;
    }
    console.log('Database connection closed.');
  });
}, 1000);
