import { requireAuth } from '../lib/db.js';

export function registerTripRoutes(app, db) {
  app.post('/api/trips', requireAuth, (req, res) => {
    const {
      vehicleId,
      startDatetime,
      endDatetime,
      startOdometer,
      endOdometer,
      purpose,
    } = req.body || {};

    if (!vehicleId || !startDatetime || !endDatetime || startOdometer == null || endOdometer == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userId = req.session.user.id;
    const insert = db.prepare(`
      INSERT INTO trips (
        user_id, vehicle_id, start_datetime, end_datetime, start_odometer, end_odometer, purpose
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = insert.run(
      userId,
      vehicleId,
      startDatetime,
      endDatetime,
      startOdometer,
      endOdometer,
      purpose || null
    );

    const trip = db
      .prepare(
        `SELECT t.*, v.name AS vehicle_name, v.license_plate, u.full_name
         FROM trips t
         JOIN vehicles v ON v.id = t.vehicle_id
         JOIN users u ON u.id = t.user_id
         WHERE t.id = ?`
      )
      .get(info.lastInsertRowid);

    res.status(201).json({ trip });
  });

  app.get('/api/trips/recent', requireAuth, (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const rows = db
      .prepare(
        `SELECT t.*, v.name AS vehicle_name, v.license_plate, u.full_name
         FROM trips t
         JOIN vehicles v ON v.id = t.vehicle_id
         JOIN users u ON u.id = t.user_id
         ORDER BY t.created_at DESC
         LIMIT ?`
      )
      .all(limit);
    res.json({ trips: rows });
  });
} 