# Kinetic — Financial Habit Builder & Wealth Growth Tracker

Full-stack personal-finance platform built with **React** (Vite), **Node.js**, **Express**, **PostgreSQL**, and **Prisma**, per the internship PRD.

## Included modules (Phase 1 scope)

- Secure JWT registration and login (bcrypt password hashing, Zod validation)
- Income & expense tracking with preset categories (Food, Transport, Rent, Utilities, Shopping, etc.)
- **Recurring income source management** (salary, freelancing, rent)
- **Monthly spending reports** with per-category breakdowns
- Savings goals with progress percentage and **"add funds"** contribution
- Daily/weekly/monthly financial habits with completion check-ins, streaks, and **daily reminders**
- Net-worth dashboard and wealth analytics built from **real transaction history** (no dummy data)
- Monthly cash-flow chart (income vs expenses)
- **Admin panel**: platform analytics, top spending categories, habit completion rate, active users, user management, and **feedback handling**

## Tech stack

- Frontend: React 18, Vite, React Router, Recharts, Lucide icons
- Backend: Node.js, Express, JWT, bcrypt, Zod
- Database: PostgreSQL with Prisma ORM
- Code-split builds for fast dashboard loading

## Run locally

1. Start PostgreSQL with Docker: `docker compose up -d postgres`
2. The included `server/.env` is preconfigured for the local container. Change the JWT secret before deployment.
3. Install packages: `npm run install:all`
4. Run migrations: `npm run prisma:migrate --prefix server -- --name init`
5. Start both apps: `npm run dev`

The React app runs at `http://localhost:5173` and the API at `http://localhost:4000`.

To access the admin page, set a user's `role` to `ADMIN` in Prisma Studio: `npm exec prisma studio --prefix server`.

## API endpoints

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/POST /api/transactions`, `DELETE /api/transactions/:id`
- `GET/POST /api/income-sources`, `DELETE /api/income-sources/:id`
- `GET/POST /api/goals`, `PATCH /api/goals/:id`, `DELETE /api/goals/:id`
- `GET/POST /api/habits`, `POST /api/habits/:id/complete`, `DELETE /api/habits/:id`
- `GET/POST /api/assets`, `DELETE /api/assets/:id`
- `GET /api/dashboard`, `GET /api/reports/monthly`, `GET /api/feedback`
- Admin: `GET /api/admin/overview|users|analytics|feedback`, `PATCH /api/admin/feedback/:id`

## Local database commands

- Stop the database: `docker compose stop`
- Start it again: `docker compose start`
- View database logs: `docker compose logs -f postgres`
- Remove all local database data (destructive): `docker compose down -v`