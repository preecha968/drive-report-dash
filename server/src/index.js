import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDatabase } from './lib/db.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerVehicleRoutes } from './routes/vehicles.js';
import { registerTripRoutes } from './routes/trips.js';
import { scheduleTelegramReport } from './jobs/telegramReport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Ensure DB and seed data
const db = ensureDatabase(path.join(__dirname, '../data/app.db'));

// Sessions
const SQLiteStore = SQLiteStoreFactory(session);
app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.sqlite',
      dir: path.join(__dirname, '../data'),
    }),
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Routes
registerAuthRoutes(app, db);
registerVehicleRoutes(app, db);
registerTripRoutes(app, db);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Cron
scheduleTelegramReport(db);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
}); 