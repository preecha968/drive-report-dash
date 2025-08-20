import { requireAuth } from '../lib/db.js';

export function registerVehicleRoutes(app, db) {
  app.get('/api/vehicles', requireAuth, (_req, res) => {
    const vehicles = db.prepare('SELECT * FROM vehicles ORDER BY name').all();
    res.json({ vehicles });
  });
} 