# Testing Guide — Attendance Tracker

This is a practical guide for manually verifying the whole system end-to-end: what
every piece is, how they talk to each other, how to stand it up locally, and a
role-by-role script for clicking through every feature. It also calls out real gaps
found while writing this guide (missing tests, missing UI, dead config) so you know
what "everything works" actually means right now.

---

## 1. Architecture map — how the pieces sync

### Runtime pieces

| Piece                           | Port | What it is                                                           |
| ------------------------------- | ---- | -------------------------------------------------------------------- |
| `apps/web`                      | 3000 | Next.js 16 frontend, all 4 role dashboards                           |
| `services/auth-service`         | 3001 | Login/refresh/logout, owns the **only** Prisma schema                |
| `services/user-service`         | 3002 | Cohorts, admins, students, batches, mentors, stats                   |
| `services/attendance-service`   | 3003 | QR/manual codes, attendance marking, reports, Socket.IO              |
| `services/schedule-service`     | 3004 | Weekly class schedules, eligibility checks                           |
| `services/notification-service` | 3005 | **Stub.** Only a `/health` route — no DB, no logic, nothing calls it |

All 6 are started together by `pnpm dev` (Turborepo fans this out to every
workspace's own `dev` script). Ports come from `packages/config`'s `SERVICE_PORTS`,
which reads `AUTH_SERVICE_PORT`, `USER_SERVICE_PORT`, etc. from your `.env` — nothing
reads a generic `$PORT`.

### Database: one schema, one owner

There is **one shared Postgres database** (`attendance_tracker`) and **one Prisma
schema**, living at `services/auth-service/prisma/schema.prisma`. It defines every
model used across the whole app: `User`, `Cohort`, `Admin`, `Student`, `Batch`,
`Mentor`, `Schedule`, `Attendance`, `AttendanceCode`.

- `user-service` and `schedule-service` don't have their own schema — their
  `prisma.config.ts` points straight at `auth-service`'s schema file.
- `attendance-service` uses the same generated `@prisma/client` but owns no schema
  file of its own.
- `notification-service` doesn't use Prisma at all.
- **Practical consequence:** migrations only ever run from `services/auth-service`.
  If you change any model, that's the one place to run `prisma migrate dev`.

### Frontend → backend wiring

`apps/web/src/lib/api-client.ts` exports four pre-configured HTTP clients, each
bound to one service via env var (with `localhost` fallbacks for local dev):

| Client                | Env var                              | Talks to                                                     |
| --------------------- | ------------------------------------ | ------------------------------------------------------------ |
| `apiClient`           | `NEXT_PUBLIC_AUTH_SERVICE_URL`       | auth-service (login/refresh)                                 |
| `userApiClient`       | `NEXT_PUBLIC_USER_SERVICE_URL`       | user-service (cohorts/students/batches/mentors/admins/stats) |
| `attendanceApiClient` | `NEXT_PUBLIC_ATTENDANCE_SERVICE_URL` | attendance-service (codes/marking/reports)                   |
| `scheduleApiClient`   | `NEXT_PUBLIC_SCHEDULE_SERVICE_URL`   | schedule-service                                             |

Every client auto-attaches `Authorization: Bearer <token>` and, on a 401, silently
calls `POST /api/auth/refresh` once before retrying. There is **no client for
notification-service** — nothing in the frontend ever calls it, consistent with it
being a stub.

`apps/web/src/lib/socket-client.ts` opens a Socket.IO connection to
`NEXT_PUBLIC_ATTENDANCE_SERVICE_URL` (same origin as `attendanceApiClient`) — the
attendance-service's Express app and Socket.IO server share one HTTP server.

### Auth & role enforcement

JWT access + refresh tokens, stored in `localStorage` on the frontend. Every
dashboard page wraps itself in `<ProtectedRoute allowedRoles={[...]}>`, which
redirects unauthenticated users to `/login` and wrong-role users to `/unauthorized`.
**This is client-side only** — there's no Next.js middleware gate, so it's a UX
convenience, not a security boundary. The actual security boundary is each backend
service's own `authenticate` + `requireAdmin`/role middleware, which every protected
route in every service applies independently.

### QR / attendance flow

- A student's QR page (`/student/attendance`) asks attendance-service for a code
  either over the Socket.IO event `attendance-code:refresh` (preferred) or, if the
  socket isn't connected, `POST /api/attendance-codes/qr` (fallback).
- Each QR code is a JWT signed with `JWT_SECRET`, embedding
  `{studentId, scheduleId, codeId}`, expiring **30 seconds** after issue. The frontend
  re-requests a fresh code automatically every 30 seconds (`CodeRefreshTimer`).
- The manual-code alternative (`/student/attendance/manual`,
  `POST /api/attendance-codes/manual`) issues a 6-character code valid until the
  schedule's end time instead of 30 seconds — meant as a fallback when camera/QR
  isn't practical.
- A mentor marks attendance by either scanning a QR (`QRScanner`, using the
  `html5-qrcode` library) or typing a manual code (`ManualCodeInput`) — **both paths
  call the exact same endpoint**, `POST /api/attendance/mark`, with `{ code }` in the
  body. The server tells QR vs. manual codes apart by format (a 3-part JWT vs. a
  plain 6-char string), not by which UI called it.

### Things that exist but don't do anything yet (don't waste time debugging these)

- **Redis** is declared in `.env`/`docker-compose.yml` (`REDIS_URL`,
  attendance-service `depends_on: redis`) but **no service code imports a Redis
  client anywhere** (verified by grep). It's provisioned but unused — codes are
  stored in Postgres, not cached in Redis.
- **notification-service** has no database usage, no business logic, and (before this
  guide's nginx fix, see `DEPLOYMENT_AWS.md`) no reverse-proxy route — it's a
  health-check-only placeholder for a future phase.
- The root `README.md` says `npm install` — the repo is actually **pnpm-only**
  (`packageManager: pnpm@10.33.2`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`). Use pnpm.

---

## 2. Local environment setup

**Prerequisites:** Node 24, `pnpm` (`corepack enable` will pick up the pinned
version), Docker Desktop (for Postgres/Redis containers — or point `DATABASE_URL` at
a Postgres you already have running).

```bash
git clone <repo>
cd attendance-tracker
cp .env.example .env
# edit .env: at minimum set real JWT_SECRET / JWT_REFRESH_SECRET
# (the placeholders in .env.example are not safe to use even locally,
#  since a weak JWT_SECRET means anyone can forge a valid access token)

pnpm install

docker compose up postgres redis -d

cd services/auth-service
npx prisma migrate dev --name init
npx prisma generate
npx tsx src/seed.ts
cd ../..

pnpm dev   # runs turbo dev — starts web + all 5 services together
```

Confirm everything is actually up before testing anything else:

```bash
curl http://localhost:3000            # Next.js should respond with HTML
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
```

---

## 3. Manual QA script, role by role

There is exactly **one** seeded account — a Super Admin — and no seeded Admin,
Mentor, or Student. To exercise every role you build the chain yourself, in this
order, starting from the seed.

**Seeded login:** `superadmin@attendance.app` / `SuperAdmin@123`
(overridable via `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` in `.env` before
seeding).

### Step 1 — Super Admin

1. Log in at `/login` → should redirect to `/super-admin`.
2. Check the overview stats cards render (`totalUsers`, `totalCohorts`, etc.).
3. `/super-admin/cohorts` → create a Cohort (e.g. "2026 Batch").
4. Open the new cohort's detail page → "Assign Admin" → "Create New Admin" tab → fill
   name/email/password → submit.
5. `/super-admin/admins` → confirm the new admin appears in the list.
6. Log out.

### Step 2 — Admin

1. Log in with the admin account just created → should redirect to `/admin`.
2. `/admin/batches` → create one or more batches under your cohort.
3. `/admin/students/upload` → pick your cohort → upload `students-sample.csv` (35
   sample rows, already in the repo root) → confirm the preview table looks right →
   click "Upload N Students" → confirm the success screen shows a created count and a
   batch-allocation summary.
   - Note the on-screen message: **every bulk-created student's password is
     `Welcome@<regno>`** (e.g. regno `2021001` → `Welcome@2021001`). You'll use this
     to log in as a student later.
4. `/admin/students` → confirm the uploaded students appear, filterable by
   cohort/shift/search.
5. **Create a Mentor.** There's no UI for this yet — do it via a direct API call using
   the admin's access token (open devtools → Application → Local Storage, or just
   copy the token your browser sent on any request):
   ```bash
   curl -X POST http://localhost:3002/api/mentors \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
     -d '{
       "email": "mentor1@example.com",
       "password": "MentorPass123",
       "name": "Mentor One",
       "cohortId": "<COHORT_ID_FROM_STEP_1>"
     }'
   ```
6. `/admin/schedules/create` → pick batch, day, period, shift, start/end time, and
   assign the mentor you just created via the dropdown.
7. `/admin/schedules/timetable` → confirm the new slot shows up in the weekly grid.

### Step 3 — Mentor

1. Log in with `mentor1@example.com` / `MentorPass123` → should redirect to
   `/mentor`.
2. `/mentor/schedule` → confirm the schedule created in Step 2 appears.
3. `/mentor/attendance` → pick that schedule.
4. Test **QR scan**: this needs a live student QR code on screen somewhere, so open a
   second browser (or incognito window / second device) logged in as a student (Step
   4 first, then come back here) and point the mentor's camera at the student's QR.
   `QRScanner` pauses itself after a successful decode and shows a toast
   `"<name> marked present"`.
5. Test **manual entry** at `/mentor/attendance/manual`: have the student generate a
   manual code (`/student/attendance/manual`) and type it in — same
   `POST /api/attendance/mark` endpoint under the hood, just a different input path.
6. Confirm the attendance list on `/mentor/attendance` updates to show the student as
   present.

### Step 4 — Student

1. Log in with `<regno>` — actually the **email** from the CSV — and
   `Welcome@<regno>` → should redirect to `/student`.
2. `/student/schedule` → confirm today's class (created in Step 2) is visible.
3. `/student/attendance` → confirm a QR code renders and the circular countdown timer
   ticks down from 30 and auto-refreshes (watch the QR image actually change, not
   just the timer resetting).
4. `/student/attendance/manual` → confirm a 6-character code is generated (use this
   for the mentor's manual-entry test in Step 3.5).
5. After the mentor marks you present, check `/student/attendance/history` — confirm
   the record shows up with status `PRESENT` and the correct method (`QR_SCAN` or
   `MANUAL_CODE`).

### Step 5 — Cross-cutting checks

Run these once the happy path above works, to catch the actual business logic bugs
rather than just "does the page render":

- **Shift eligibility:** a `MORNING`-shift student should be able to attend an
  `AFTERNOON` schedule for their batch (per the eligibility rule), but check the
  reverse doesn't silently work too — try scanning/marking a mismatched student and
  confirm you get an eligibility error, not a silent success.
- **Duplicate prevention:** try marking the same student present twice for the same
  schedule — should be rejected (`Attendance` has a unique constraint on
  `[studentId, scheduleId]`).
- **Expired/used code rejection:** let a QR code sit past 30 seconds, or try
  reusing a manual code that's already been consumed — both should be rejected with a
  clear error, not marked present.
- **Unauthorized access:** while logged in as a Student, manually navigate to
  `/admin` — should redirect to `/unauthorized`, not show admin data.
- **Token refresh:** stay logged in past your access token's expiry (or just wait) and
  make a request — should silently refresh via `/api/auth/refresh` instead of forcing
  a re-login.
- **CSV validation:** upload a CSV with a bad `Shift` value (e.g. `EVENING`) or a
  missing column — confirm the row is flagged with a per-row error and skipped, not
  silently accepted or a hard crash.
- **Reports:** `/admin/reports/attendance` — confirm the rate bar colors correctly
  (green ≥75%, amber ≥50%, red below); `/admin/reports/students` — confirm
  low-attendance students are visually flagged and CSV export works.

---

## 4. Known gaps to flag to your collaborator

These aren't things to silently patch around while testing — they're real project
state worth a conversation about scope before you call "testing" done:

- **No automated tests for 3 of 5 services.** Only `auth-service` (5 test files,
  `vitest run --coverage`) and `user-service` (1 test file) have real test suites.
  `attendance-service`, `schedule-service`, and `notification-service` declare a
  `test` script but have zero test files and no `vitest.config.ts` — running
  `pnpm test` for them currently does nothing meaningful.
- **No Mentor-creation UI.** The backend endpoint (`POST /api/mentors`) is fully
  built and working; there's just no admin-facing page for it yet. Documented above
  as a `curl` workaround.
- **notification-service is an empty stub** — no DB, no logic, not wired into nginx.
  If the product is supposed to send emails/push notifications at some point, that's
  unbuilt, not broken.
- **Redis is provisioned but unused** — either wire it in (e.g. cache active QR
  codes) or drop it from the compose file/env to reduce moving parts.
- `.env.example` was missing three `NEXT_PUBLIC_*_SERVICE_URL` entries the frontend
  actually reads — fixed as part of this pass, but worth knowing it was previously
  relying entirely on hardcoded `localhost` fallbacks in the code.
