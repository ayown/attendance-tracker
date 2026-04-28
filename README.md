# Attendance Tracker

All-in-one college attendance tracking system with dynamic QR codes, role-based access control, and intelligent shift management.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, TailwindCSS 4 |
| Backend | Express.js 5 microservices, TypeScript |
| Database | PostgreSQL 17 + Prisma 7 |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.io 4 |
| Monorepo | Turborepo 2 |
| Container | Docker + Docker Compose |

## Project Structure

```
attendance-tracker/
├── apps/
│   └── web/                    # Next.js 16 frontend (port 3000)
├── services/
│   ├── auth-service/           # JWT auth (port 3001)
│   ├── user-service/           # Users, cohorts, batches (port 3002)
│   ├── attendance-service/     # Attendance + Socket.io (port 3003)
│   ├── schedule-service/       # Timetables (port 3004)
│   └── notification-service/  # Email/push notifications (port 3005)
├── packages/
│   ├── shared-types/           # Shared TypeScript types
│   ├── config/                 # Shared configuration constants
│   └── utils/                  # Shared utilities
└── infrastructure/
    ├── docker/                 # Dockerfiles
    └── nginx/                  # Reverse proxy config
```

## Prerequisites

- Node.js >= 20
- npm >= 10
- Docker & Docker Compose v2

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd attendance-tracker
cp .env.example .env
npm install
```

### 2. Start infrastructure (PostgreSQL + Redis)

```bash
docker compose up postgres redis -d
```

### 3. Run database migrations

```bash
cd services/auth-service
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

### 4. Start all services in development

```bash
npm run dev
```

This runs all services and the Next.js app in parallel via Turborepo.

### 5. Or start everything with Docker

```bash
docker compose up -d
```

## Service Health Checks

| Service | Health endpoint |
|---------|----------------|
| auth-service | http://localhost:3001/health |
| user-service | http://localhost:3002/health |
| attendance-service | http://localhost:3003/health |
| schedule-service | http://localhost:3004/health |
| notification-service | http://localhost:3005/health |
| web | http://localhost:3000 |

## Development Scripts

```bash
npm run dev          # Start all services in watch mode
npm run build        # Build all packages and services
npm run lint         # Lint all workspaces
npm run format       # Format all files with Prettier
npm run test         # Run all tests
npm run docker:up    # Start Docker Compose services
npm run docker:down  # Stop Docker Compose services
npm run docker:logs  # Tail Docker logs
```

## Roles

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Manages cohorts and assigns admins |
| `ADMIN` | Manages students, batches, schedules within cohort |
| `MENTOR` | Marks attendance for assigned batches |
| `STUDENT` | Views schedule, generates QR/manual codes |

## Development Phases

- **Phase 1** ✅ Project setup & architecture foundation
- **Phase 2** Auth & authorization system
- **Phase 3** User service & Super Admin dashboard
- **Phase 4** Student management & batch system
- **Phase 5** Scheduling system
- **Phase 6** QR code & code generation
- **Phase 7** Attendance marking system
- **Phase 8** Student & mentor dashboards
- **Phase 9** Admin dashboard & reports
- **Phase 10** Testing, optimization & deployment
