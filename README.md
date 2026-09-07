# 🚀 Kinetic

Kinetic is a modern, full-stack personal-finance application designed to help users manage transactions, build better financial habits, track savings goals, and understand their wealth growth over time. The platform also provides administrators with analytics, user management, and feedback tools.

---

## 🌟 Key Features

### 💰 For Users

- **Dashboard**: Review net worth, income, expenses, savings, and monthly cash flow in one place.
- **Transaction Tracking**: Add and manage income and expenses using preset financial categories.
- **Income Sources**: Track recurring income such as salary, freelance work, and other sources.
- **Monthly Reports**: View spending totals and category-level breakdowns.
- **Savings Goals**: Create goals, monitor progress, and add contributions.
- **Financial Habits**: Create daily, weekly, and monthly habits with check-ins and streak tracking.
- **Assets and Wealth**: Record assets and investments to support net-worth calculations.
- **Feedback**: Send product feedback directly from the application.

### 👩‍💼 For Admins

- **Admin Dashboard**: View platform-wide financial and usage analytics.
- **User Management**: Review, update, and remove user accounts.
- **Analytics**: Inspect spending categories, active users, and habit completion rates.
- **Feedback Management**: Review feedback and update its status.

### 🔒 Core Security

- **Authentication**: JWT-based registration and login.
- **Password Hashing**: Bcrypt password hashing before credentials are stored.
- **Input Validation**: Zod validation for authentication and financial data.
- **Protected Routes**: Middleware separates authenticated finance routes from admin-only routes.
- **Environment Configuration**: Database credentials and JWT secrets are loaded from local environment files.
- **Hosted Configuration**: Production secrets are injected by the hosting platforms and are never committed to the repository.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| --- | --- | --- |
| **Frontend** | React 18 & Vite | Modern client application and development server |
| **Routing** | React Router | Client-side page navigation |
| **Charts** | Recharts | Dashboard and financial visualizations |
| **Icons** | Lucide React | Interface icons |
| **Backend** | Node.js & Express | REST API server running in ES Modules mode |
| **Database** | PostgreSQL | Relational data storage |
| **ORM** | Prisma | Database schema, migrations, and queries |
| **Validation** | Zod | Request validation |
| **Authentication** | JWT & bcryptjs | Session tokens and password hashing |

---

## 📁 Repository Structure

```text
KINETIC/
├── client/
│   ├── src/
│   │   ├── components/       # Shared layout and UI components
│   │   ├── constants/        # Navigation and application constants
│   │   ├── lib/              # API client helpers
│   │   ├── pages/            # Dashboard, finance, goals, habits, and admin views
│   │   ├── utils/            # Formatting and frontend utilities
│   │   ├── App.jsx           # Application routing root
│   │   ├── main.jsx          # Client entrypoint
│   │   └── styles.css        # Global styles
│   ├── index.html
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   ├── migrations/       # Database migration history
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Local sample data generator
│   ├── src/
│   │   ├── middleware/       # Authentication middleware
│   │   ├── routes/           # Auth, finance, and admin API routes
│   │   ├── prisma.js         # Prisma client
│   │   └── server.js         # API server entrypoint
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml        # Local PostgreSQL service
├── package.json              # Root development scripts
└── README.md
```

---

## ⚙️ Getting Started & Installation

### Prerequisites

Make sure you have the following installed:

- **Node.js** and npm
- **Docker Desktop** with Docker Compose

### 1. Configure the Server

1. Copy `server/.env.example` to `server/.env`.
2. Set a long, unique value for `JWT_SECRET`.
3. Confirm that `DATABASE_URL` points to your local PostgreSQL database.
4. Keep `server/.env` private. Never commit it or share its values.

The environment file should contain the required variable names, with your own local values:

```text
NODE_ENV=development
DATABASE_URL=your_local_database_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
COOKIE_SAME_SITE=lax
PORT=4000
```

### 2. Install Dependencies

From the project root, run:

```text
npm run install:all
```

### 3. Start PostgreSQL

For local Docker Compose credentials, copy the root `.env.example` to `.env` and set your own local values. PostgreSQL is bound to `127.0.0.1` only and is not exposed publicly.

```text
docker compose up -d postgres
```

### 4. Run Database Migrations

```text
npm run prisma:migrate --prefix server -- --name init
```

### 5. Start the Application

```text
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:4000`.

For a deployed frontend, create `client/.env` from `client/.env.example` and set `VITE_API_URL` to the deployed API base URL before building:

```text
npm run build --prefix client
```

### Optional: Load Sample Data

To populate a local database with sample transactions, goals, assets, income sources, habits, and feedback:

```text
npm run seed --prefix server
```

The seed command is intended for local development only. It creates or refreshes a local administrator account and sample data without exposing credentials in this README.

Set `SEED_USER_EMAIL` and `SEED_USER_PASSWORD` in your local `server/.env` before running the seed command. Use throwaway local-only values and never reuse production credentials.

For production, provide separate secret values and database credentials through the hosting platform or a private environment manager. Set `NODE_ENV=production`, a production `DATABASE_URL`, a random `JWT_SECRET` of at least 32 characters, and the deployed frontend URL in `CLIENT_URL`. Run migrations with:

```text
npm run prisma:migrate:deploy --prefix server
```

Do not run the seed command in production.

### Deployment with Neon, Render, and Vercel

The database itself is not pushed to GitHub. Neon stores the production PostgreSQL database, while the migration files in `server/prisma/migrations` describe its schema.

1. Create a Neon PostgreSQL project and copy its connection string into Render as `DATABASE_URL`.
2. Create a Render web service with `server` as the root directory.
3. Set the Render build command to `npm install && npm run prisma:generate` and the start command to `npm start`.
4. Set these Render environment variables: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, and `COOKIE_SAME_SITE=none`.
5. Run `npm run prisma:migrate:deploy` from the Render shell or a one-time deploy step. This applies all committed migrations to Neon.
6. Create a Vercel project with `client` as the root directory and set `VITE_API_URL` to the Render API URL ending in `/api`.
7. Set the final Vercel URL as Render's `CLIENT_URL`, then redeploy the API if the URL changed.

Render and Vercel provide environment variables at runtime/build time; neither platform needs a committed `.env` file. Do not run the seed command against Neon production. Create the first production admin through registration and promote it through a controlled database/admin operation, or use a separately reviewed one-time staging seed.

### Optional: Open Prisma Studio

```text
npm exec prisma studio --prefix server
```

Prisma Studio can be used to inspect local data and manage local user roles.

---

## 📡 API Routes

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Finance

- `GET /api/categories`
- `GET|POST /api/transactions`
- `DELETE /api/transactions/:id`
- `GET|POST /api/income-sources`
- `DELETE /api/income-sources/:id`
- `GET /api/reports/monthly`
- `GET|POST /api/goals`
- `PATCH /api/goals/:id`
- `DELETE /api/goals/:id`
- `GET|POST /api/habits`
- `POST /api/habits/:id/complete`
- `DELETE /api/habits/:id`
- `GET|POST /api/assets`
- `DELETE /api/assets/:id`
- `POST /api/feedback`
- `GET /api/dashboard`

### Admin

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/analytics`
- `GET /api/admin/feedback`
- `PATCH /api/admin/feedback/:id`

### Health Check

- `GET /api/health`

---

## 🗄️ Database Commands

Production deployments must use a private or managed PostgreSQL instance. Do not publish PostgreSQL to the internet. Set production database credentials through a secret manager and run migrations with:

```text
npm run prisma:migrate:deploy --prefix server
```

Managed PostgreSQL providers should have automated backups and point-in-time recovery enabled in their production settings. For self-managed PostgreSQL, schedule `pg_dump` with Windows Task Scheduler or cron, retain multiple backup generations, and test restores regularly.

Stop the local database:

```text
docker compose stop
```

Start it again:

```text
docker compose start
```

View database logs:

```text
docker compose logs -f postgres
```

Remove the local database volume and all local data:

```text
docker compose down -v
```

⚠️ The final command is destructive and should only be used for local development.

---

## 📄 License

No license has been specified for this project yet.