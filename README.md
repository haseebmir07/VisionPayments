# Vision Glass & Interior — Employee Expense Management System

A production-ready expense management system built with Next.js 14, TypeScript, MongoDB, and a beautiful dark-themed UI.

## Features

- **Dashboard** — Real-time stats, 30-day expense charts, employee breakdowns
- **Employee Management** — CRUD operations, auto-generated IDs (EMP-001), department tracking
- **Expense Tracking** — Full CRUD with filters (employee, date range, payment mode)
- **Reports** — PDF and CSV export with comprehensive expense breakdowns
- **Email Automation** — Daily and monthly reports via Resend/Nodemailer
- **Authentication** — NextAuth v5 with Credentials + Google OAuth
- **RBAC** — Role-based access control (Admin/User)
- **Dark Theme** — Premium black and indigo design system

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas (Mongoose) |
| Auth | NextAuth.js v5 (Auth.js) |
| State | Zustand (client) + React Query (server) |
| Forms | React Hook Form + Zod |
| Email | Resend + Nodemailer fallback |
| Charts | Recharts |
| CSV | PapaParse |

## Setup Instructions

### 1. Install Dependencies

```bash
cd moneyflow
npm install
```

### 2. MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Shared Cluster** (free tier M0)
3. Under **Database Access**, create a user with password
4. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) for development
5. Click **Connect** → **Connect your application** → Copy the connection string
6. Replace `<password>` in the connection string with your database user's password

### 3. Resend Email Setup

1. Go to [resend.com](https://resend.com) and create an account
2. Navigate to **API Keys** and create a new key
3. Copy the API key (starts with `re_`)

### 4. Google OAuth Setup (Optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Application Type** to "Web application"
6. Add **Authorized redirect URI**: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret

### 5. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `RESEND_API_KEY` | Resend dashboard |
| `REPORT_EMAIL_TO` | Your admin email |
| `CRON_SECRET` | Run: `openssl rand -hex 32` |

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the login page.

### 7. Create Your First Account

1. Navigate to `/register`
2. Create an account with your email and password
3. To make yourself admin, update the user document in MongoDB:
   ```javascript
   db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
   ```

## Project Structure

```
moneyflow/
├── app/
│   ├── (auth)/login, register       ← Authentication pages
│   ├── (dashboard)/                  ← Protected dashboard pages
│   │   ├── dashboard/                ← Stats, charts, breakdowns
│   │   ├── employees/                ← Employee list + detail
│   │   ├── expenses/                 ← Filtered expense management
│   │   └── reports/                  ← PDF/CSV download
│   └── api/                          ← REST API routes
├── components/
│   ├── ui/                           ← Button, Input, Modal, Table, Card
│   ├── layout/                       ← Sidebar, Topbar
│   ├── dashboard/                    ← StatCard, Charts, Tables
│   ├── employees/                    ← EmployeeForm
│   └── expenses/                     ← ExpenseForm
├── lib/                              ← DB, Auth, Utils, Email, PDF, CSV
├── models/                           ← Mongoose: User, Employee, Expense
├── store/                            ← Zustand: UI, Filters
├── hooks/                            ← React Query hooks
└── types/                            ← TypeScript interfaces
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers |
| GET | `/api/dashboard` | Dashboard stats |
| GET/POST | `/api/employees` | List/Create employees |
| GET/PATCH/DELETE | `/api/employees/[id]` | Single employee CRUD |
| GET/POST | `/api/expenses` | List/Create expenses |
| GET/PATCH/DELETE | `/api/expenses/[id]` | Single expense CRUD |
| GET | `/api/reports/pdf` | Download PDF report |
| GET | `/api/reports/csv` | Download CSV export |
| GET | `/api/cron/daily` | Trigger daily report |
| GET | `/api/cron/monthly` | Trigger monthly report |

## Design System

- **Background**: #000000 (page), #0a0a0a (cards), #111111 (elevated)
- **Accent**: #6366f1 (indigo), #22d3ee (cyan)
- **Success/Warning/Danger**: #10b981 / #f59e0b / #ef4444
- **Text**: #f9fafb / #9ca3af / #4b5563
- **Border radius**: 12px cards, 8px inputs, 6px buttons
- **Transitions**: 200ms ease on all interactive elements

## License

MIT
