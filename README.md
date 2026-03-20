# TaskFlow — Task Management System

A full-stack task management application built with **Node.js + TypeScript** (backend) and **Next.js 14 + TypeScript** (frontend).

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Features](#features)
- [Security](#security)
- [Design Decisions](#design-decisions)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                    │
│              Next.js 14 App Router + TypeScript          │
│    Auth Pages  ──►  Dashboard  ──►  Tasks (CRUD)         │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND API (Node.js)                     │
│              Express + TypeScript + Prisma               │
│  /api/auth/*  ──►  AuthService  ──►  JWT tokens          │
│  /api/tasks/* ──►  TaskService  ──►  CRUD + pagination   │
└────────────────────────┬────────────────────────────────┘
                         │ Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE (SQLite)                       │
│           Users  ──  Tasks  ──  RefreshTokens            │
└─────────────────────────────────────────────────────────┘
```

### Auth Flow

```
Register/Login
     │
     ▼
Backend validates credentials
     │
     ├──► Access Token  (15 min, stored in localStorage)
     └──► Refresh Token (7 days, stored in localStorage + DB)

Every API request:
  Authorization: Bearer <accessToken>

On 401 response (token expired):
  Frontend auto-retries with refreshToken → gets new accessToken
  (queues concurrent requests until refresh completes)
```

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|------------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| ORM | Prisma 5 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | express-validator |
| Security | Helmet, CORS, express-rate-limit |

### Frontend
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (with interceptors) |
| Toast | react-hot-toast |
| Icons | lucide-react |
| Fonts | DM Sans + Fraunces (Google Fonts) |

---

## Project Structure

```
task-management/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB schema (User, Task, RefreshToken)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts # Login, register, refresh, logout
│   │   │   └── task.controller.ts # CRUD + toggle + stats
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT verification
│   │   │   ├── validate.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts     # /api/auth/*
│   │   │   └── task.routes.ts     # /api/tasks/*
│   │   ├── services/
│   │   │   ├── auth.service.ts    # Business logic + token rotation
│   │   │   └── task.service.ts    # CRUD + pagination + filtering
│   │   ├── types/index.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── response.ts
│   │   │   └── seed.ts
│   │   ├── app.ts                 # Express setup + middleware
│   │   └── index.ts               # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── auth/
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   ├── dashboard/
    │   │   │   ├── layout.tsx     # Sidebar + protected route
    │   │   │   ├── page.tsx       # Overview + stats
    │   │   │   └── tasks/page.tsx # Full task management
    │   │   ├── globals.css        # Tailwind + design tokens
    │   │   ├── layout.tsx         # Root layout + providers
    │   │   └── page.tsx           # Redirect to dashboard/login
    │   ├── components/
    │   │   └── tasks/
    │   │       ├── TaskCard.tsx   # Individual task with menu
    │   │       ├── TaskForm.tsx   # Create/edit modal
    │   │       └── DeleteDialog.tsx
    │   ├── hooks/
    │   │   ├── use-auth.tsx       # Auth context + provider
    │   │   ├── use-tasks.ts       # Task state management
    │   │   └── use-debounce.ts
    │   ├── lib/
    │   │   ├── api-client.ts      # Axios + auto token refresh
    │   │   ├── auth-api.ts
    │   │   ├── tasks-api.ts
    │   │   └── utils.ts
    │   └── types/index.ts
    ├── .env.local.example
    ├── next.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- Git

### Backend Setup

```bash
# 1. Navigate to backend directory
cd task-management/backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env — the defaults work for local development

# 4. Set up the database
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations (creates dev.db)

# 5. (Optional) Seed with demo data
npm run db:seed
# Creates: demo@example.com / Demo1234!

# 6. Start the dev server
npm run dev
# API running at http://localhost:3001
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory (new terminal)
cd task-management/frontend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.local.example .env.local
# Default points to http://localhost:3001/api

# 4. Start the dev server
npm run dev
# App running at http://localhost:3000
```

Open `http://localhost:3000` — you'll be redirected to login.

**Demo credentials** (if you ran the seed):
- Email: `demo@example.com`
- Password: `Demo1234!`

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| POST | `/api/auth/refresh` | — | Rotate tokens |
| POST | `/api/auth/logout` | — | Invalidate refresh token |
| POST | `/api/auth/logout-all` | ✓ | Invalidate all sessions |
| GET | `/api/auth/me` | ✓ | Get current user |

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Secret123"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "createdAt": "..." },
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{ "refreshToken": "<token>" }
```

---

### Task Endpoints

All task endpoints require `Authorization: Bearer <accessToken>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (paginated, filterable) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/stats` | Get task counts by status |
| GET | `/api/tasks/:id` | Get single task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/toggle` | Cycle status |

#### GET /api/tasks — Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `status` | `PENDING\|IN_PROGRESS\|COMPLETED` | Filter by status |
| `priority` | `LOW\|MEDIUM\|HIGH` | Filter by priority |
| `search` | string | Search in title (case-insensitive) |
| `sortBy` | string | Field to sort (default: `createdAt`) |
| `sortOrder` | `asc\|desc` | Sort direction (default: `desc`) |

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [ { "id": "...", "title": "...", "status": "PENDING", ... } ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### POST /api/tasks
```json
{
  "title": "Write unit tests",
  "description": "Cover all service methods",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2024-12-31"
}
```

---

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Valid email is required"],
    "password": ["At least 8 characters"]
  }
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Unauthenticated / expired token |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already exists) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Features

### Backend
- ✅ JWT authentication with access + refresh tokens
- ✅ Refresh token rotation (each use issues a new token)
- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ Full CRUD for tasks
- ✅ Pagination, filtering by status/priority, search by title
- ✅ Task toggle cycles: `PENDING → IN_PROGRESS → COMPLETED → PENDING`
- ✅ User-scoped tasks (users can only access their own tasks)
- ✅ Input validation with express-validator
- ✅ Rate limiting (100 req/15min global, 20 req/15min on auth routes)
- ✅ Helmet security headers
- ✅ CORS configured
- ✅ Structured error responses
- ✅ Database seed script

### Frontend
- ✅ Login + Register pages with form validation (Zod)
- ✅ Automatic token refresh (queues concurrent failed requests)
- ✅ Protected routes (redirect to login if unauthenticated)
- ✅ Dashboard with stats overview + progress bar
- ✅ Task grid with responsive layout
- ✅ Create / Edit task modal
- ✅ Delete confirmation dialog
- ✅ Status toggle directly on card
- ✅ Search with debounce (350ms)
- ✅ Filter by status and priority
- ✅ Sort by date, title, priority
- ✅ Pagination with page numbers
- ✅ Active filter chips with clear buttons
- ✅ Loading skeletons
- ✅ Toast notifications for all actions
- ✅ Fully responsive (mobile sidebar → bottom nav)
- ✅ Overdue task highlighting

---

## Security

- Passwords are **never stored in plaintext** — bcrypt with 12 rounds
- Access tokens are **short-lived** (15 minutes) to limit exposure
- Refresh tokens are **rotated on every use** — old token invalidated immediately
- All task queries are **scoped to the authenticated user**
- Rate limiting prevents brute-force on auth endpoints
- Helmet sets secure HTTP response headers
- Input validation on all endpoints prevents injection

### For Production

1. Switch `DATABASE_URL` to PostgreSQL
2. Set `NODE_ENV=production`
3. Use strong, unique values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
4. Enable HTTPS
5. Consider storing refresh tokens in `httpOnly` cookies instead of localStorage
6. Add Redis for token blacklisting on logout

---

## Design Decisions

**Why SQLite for development?**
Zero setup — runs entirely from a file. Production deployments should switch to PostgreSQL by changing just the `DATABASE_URL` in `.env` and `provider` in `schema.prisma`.

**Why refresh token rotation?**
Each use of a refresh token issues a new one and invalidates the old. If a token is stolen and used first, the legitimate user's next refresh will fail, alerting them to a potential compromise.

**Why not httpOnly cookies for tokens?**
For simplicity in a take-home context. In production, storing the refresh token in an httpOnly cookie prevents XSS access to the token.

**Why Prisma over TypeORM?**
Better TypeScript inference, more expressive query API, and auto-generated migrations make development faster and safer.
