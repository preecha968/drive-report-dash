import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export function ensureDatabase(dbPath) {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      employee_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'employee'
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      license_plate TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vehicle_id INTEGER NOT NULL,
      start_datetime TEXT NOT NULL,
      end_datetime TEXT NOT NULL,
      start_odometer INTEGER NOT NULL,
      end_odometer INTEGER NOT NULL,
      purpose TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
    );
  `);

  // Seed users and vehicles if empty
  const userCount = db.prepare('SELECT COUNT(1) AS c FROM users').get().c;
  if (userCount === 0) {
    const insertUser = db.prepare(
      'INSERT INTO users (username, employee_id, full_name, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    );
    const passwordHash1 = bcrypt.hashSync('password123', 10);
    const passwordHash2 = bcrypt.hashSync('password123', 10);
    insertUser.run('employee1', 'E001', 'Employee One', passwordHash1, 'employee');
    insertUser.run('employee2', 'E002', 'Employee Two', passwordHash2, 'employee');
  }

  const vehicleCount = db.prepare('SELECT COUNT(1) AS c FROM vehicles').get().c;
  if (vehicleCount === 0) {
    const insertVehicle = db.prepare(
      'INSERT INTO vehicles (name, license_plate) VALUES (?, ?)'
    );
    insertVehicle.run('Toyota Hilux', 'AB-1234');
    insertVehicle.run('Isuzu D-Max', 'CD-5678');
  }

  return db;
}

export function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

export function getTodayDateLocal() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
} 