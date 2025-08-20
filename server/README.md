Backend (Express + SQLite)

Setup

1. Create env file:

- Copy `.env.example` to `.env` and fill values

2. Install deps:

- `npm install` inside `server`

3. Run server:

- `npm start`

API Overview

- POST `/api/auth/login` { usernameOrEmployeeId, password }
- POST `/api/auth/logout`
- GET `/api/auth/me`
- GET `/api/vehicles`
- POST `/api/trips`
- GET `/api/trips/recent?limit=20`

Notes

- Default users: `employee1` / `password123`, `employee2` / `password123`
- Default vehicles: Toyota Hilux (AB-1234), Isuzu D-Max (CD-5678)
- Daily Telegram summary at 18:00 Asia/Bangkok 