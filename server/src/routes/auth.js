import bcrypt from 'bcryptjs';
import { requireAuth } from '../lib/db.js';

export function registerAuthRoutes(app, db) {
  app.post('/api/auth/login', (req, res) => {
    const { usernameOrEmployeeId, password } = req.body || {};
    if (!usernameOrEmployeeId || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }
    const user = db
      .prepare(
        'SELECT * FROM users WHERE username = ? OR employee_id = ? LIMIT 1'
      )
      .get(usernameOrEmployeeId, usernameOrEmployeeId);

    if (!user) {
      return res.status(401).json({ error: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      employee_id: user.employee_id,
      full_name: user.full_name,
      role: user.role,
    };
    res.json({ user: req.session.user });
  });

  app.post('/api/auth/logout', requireAuth, (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.session && req.session.user) {
      return res.json({ user: req.session.user });
    }
    res.status(401).json({ error: 'Unauthorized' });
  });
} 